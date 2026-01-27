import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import {
  DoctorAvailabilityException,
  DoctorAvailabilityExceptionType,
} from './entities/doctor-availability-exception.entity';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { UpdateDoctorAvailabilityDto } from './dto/update-doctor-availability.dto';
import { DoctorAvailabilityExceptionService } from './doctor-availability-exception.service';

@Injectable()
export class DoctorAvailabilityService {
  private readonly logger = new Logger(DoctorAvailabilityService.name);
  private static readonly CLINIC_OPEN_TIME = '06:00';
  private static readonly CLINIC_CLOSE_TIME = '22:00';

  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly doctorAvailabilityRepository: Repository<DoctorAvailability>,
    private readonly doctorAvailabilityExceptionService: DoctorAvailabilityExceptionService,
  ) {}

  async findByDoctorAndRange(
    doctorId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<DoctorAvailability[] | undefined> {
    try {
      if (!doctorId || !rangeStart || !rangeEnd) {
        return [];
      }

      const weekdays = this.getWeekdaysBetween(rangeStart, rangeEnd);
      if (!weekdays.length) {
        return [];
      }

      this.logger.debug(
        `[DoctorAvailability] querying doctor ${doctorId} on weekdays: ${weekdays.join(
          ', ',
        )}`,
      );

      return this.doctorAvailabilityRepository.find({
        where: {
          doctorId,
          weekday: In(weekdays),
        },
        order: {
          weekday: 'ASC',
          startTime: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error(
        `[DoctorAvailability] error finding by doctor and range: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async findAllByDoctor(
    doctorId: string,
  ): Promise<DoctorAvailability[] | undefined> {
    try {
      return this.doctorAvailabilityRepository.find({
        where: { doctorId },
        order: {
          weekday: 'ASC',
          startTime: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error(
        `[DoctorAvailability] error listing availabilities: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async create(
    doctorId: string,
    createDto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability | undefined> {
    try {
      this.validateTimeOrder(createDto.startTime, createDto.endTime);
      this.ensureWithinClinicHours(
        createDto.startTime,
        createDto.endTime,
        DoctorAvailabilityService.CLINIC_OPEN_TIME,
        DoctorAvailabilityService.CLINIC_CLOSE_TIME,
      );
      await this.ensureNoOverlap(
        doctorId,
        createDto.weekday,
        createDto.startTime,
        createDto.endTime,
      );

      const availability = this.doctorAvailabilityRepository.create({
        doctorId,
        isRecurring:
          createDto.isRecurring === undefined ? true : createDto.isRecurring,
        ...createDto,
      });

      return this.doctorAvailabilityRepository.save(availability);
    } catch (error) {
      this.logger.error(
        `[DoctorAvailability] error creating availability: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async update(
    doctorId: string,
    id: string,
    updateDto: UpdateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability | undefined> {
    try {
      const availability = await this.doctorAvailabilityRepository.findOne({
        where: { id, doctorId },
      });
      if (!availability) {
        throw new NotFoundException(
          `Availability ${id} not found for doctor ${doctorId}`,
        );
      }

      const targetWeekday =
        updateDto.weekday === undefined
          ? availability.weekday
          : updateDto.weekday;
      const targetStart = updateDto.startTime ?? availability.startTime;
      const targetEnd = updateDto.endTime ?? availability.endTime;

      this.validateTimeOrder(targetStart, targetEnd);
      this.ensureWithinClinicHours(
        targetStart,
        targetEnd,
        DoctorAvailabilityService.CLINIC_OPEN_TIME,
        DoctorAvailabilityService.CLINIC_CLOSE_TIME,
      );

      await this.ensureNoOverlap(
        doctorId,
        targetWeekday,
        targetStart,
        targetEnd,
        id,
      );

      Object.assign(availability, {
        ...updateDto,
        weekday: targetWeekday,
        startTime: targetStart,
        endTime: targetEnd,
      });

      return this.doctorAvailabilityRepository.save(availability);
    } catch (error) {
      this.logger.error(
        `[DoctorAvailability] error updating availability: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async remove(doctorId: string, id: string) {
    try {
      const availability = await this.doctorAvailabilityRepository.findOne({
        where: { id, doctorId },
      });
      if (!availability) {
        throw new NotFoundException(
          `Availability ${id} not found for doctor ${doctorId}`,
        );
      }

      await this.doctorAvailabilityRepository.remove(availability);
      return { message: 'Availability removed successfully' };
    } catch (error) {
      this.logger.error(
        `[DoctorAvailability] error removing availability: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async getAvailabilitySnapshot(
    doctorId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<DailyAvailabilitySnapshot[] | undefined> {
    try {
      if (!doctorId || !rangeStart || !rangeEnd) {
        return [];
      }

      const recurringSlots = await this.findByDoctorAndRange(
        doctorId,
        rangeStart,
        rangeEnd,
      );
      const exceptions =
        await this.doctorAvailabilityExceptionService.findByDoctorAndRange(
          doctorId,
          rangeStart,
          rangeEnd,
        );

      const dates = this.getDatesBetween(rangeStart, rangeEnd);
      if (!dates.length) {
        return [];
      }

      const slotsByWeekday = new Map<number, DoctorAvailability[]>();
      recurringSlots?.forEach((slot) => {
        const existing = slotsByWeekday.get(slot.weekday) ?? [];
        existing.push(slot);
        slotsByWeekday.set(slot.weekday, existing);
      });

      const exceptionsByDate = new Map<string, DoctorAvailabilityException[]>();
      exceptions?.forEach((exception) => {
        const key = this.toDateKey(exception.date);
        const existing = exceptionsByDate.get(key) ?? [];
        existing.push(exception);
        exceptionsByDate.set(key, existing);
      });

      return dates.map((date) => {
        const dateKey = this.toDateKey(date);
        const dayExceptions = exceptionsByDate.get(dateKey) ?? [];
        const weekday = date.getUTCDay();
        const isBlocked = dayExceptions.some(
          (exception) =>
            exception.type === DoctorAvailabilityExceptionType.BLOCKED,
        );

        const recurringForDay =
          isBlocked || !slotsByWeekday.has(weekday)
            ? []
            : (slotsByWeekday.get(weekday) ?? []);

        const slots: AvailabilitySlotSnapshot[] = [
          ...recurringForDay.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            source: 'recurring' as const,
            clinicId: slot.clinicId,
            notes: slot.notes,
          })),
          ...dayExceptions
            .filter(
              (exception) =>
                exception.type === DoctorAvailabilityExceptionType.EXTRA_HOURS,
            )
            .map((exception) => ({
              startTime: exception.startTime!,
              endTime: exception.endTime!,
              source: 'extra' as const,
              reason: exception.reason,
            })),
        ];

        return {
          date: dateKey,
          weekday,
          slots,
          exceptions: dayExceptions,
        };
      });
    } catch (error) {
      this.logger.error(
        `[DoctorAvailability] error building availability snapshot: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async isDoctorAvailableForRange(
    doctorId: string,
    clinicId: string | undefined,
    startIso: string,
    endIso: string,
  ): Promise<DoctorAvailabilityCheckResult> {
    if (!doctorId || !startIso || !endIso) {
      return {
        available: false,
        reason: 'Doctor, clinic, and appointment range are required',
      };
    }

    const startDate = new Date(startIso);
    const endDate = new Date(endIso);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        available: false,
        reason: 'Invalid ISO date provided for the appointment range',
      };
    }

    if (startDate >= endDate) {
      return {
        available: false,
        reason: 'Appointment range must have a positive duration',
      };
    }

    const normalizedStart = this.normalizeDate(startDate);
    const normalizedEnd = this.normalizeDate(endDate);
    if (normalizedStart.getTime() !== normalizedEnd.getTime()) {
      return {
        available: false,
        reason: 'Appointment must stay within a single calendar day',
      };
    }

    const snapshots =
      (await this.getAvailabilitySnapshot(doctorId, startDate, endDate)) ?? [];
    const dayKey = this.toDateKey(startDate);
    const daySnapshot = snapshots.find((snapshot) => snapshot.date === dayKey);

    if (!daySnapshot) {
      return {
        available: false,
        reason: 'No availability defined for the requested date',
      };
    }

    const isBlocked = daySnapshot.exceptions.some(
      (exception) => exception.type === DoctorAvailabilityExceptionType.BLOCKED,
    );
    if (isBlocked) {
      return {
        available: false,
        reason: 'Doctor is blocked on the requested date',
      };
    }

    const requestStartTime = this.dateToUtcTimeString(startDate);
    const requestEndTime = this.dateToUtcTimeString(endDate);
    const requestStart = this.timeToMinutes(requestStartTime);
    const requestEnd = this.timeToMinutes(requestEndTime);

    const matchingSlot = daySnapshot.slots.find((slot) => {
      if (slot.clinicId && clinicId !== slot.clinicId) {
        return false;
      }

      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);

      return requestStart >= slotStart && requestEnd <= slotEnd;
    });

    if (!matchingSlot) {
      return {
        available: false,
        reason: 'Requested time range falls outside available slots',
      };
    }

    return { available: true };
  }

  private getWeekdaysBetween(start: Date, end: Date): number[] {
    const normalizedStart = this.normalizeDate(start);
    const normalizedEnd = this.normalizeDate(end);

    if (normalizedEnd < normalizedStart) {
      return [];
    }

    const uniqueWeekdays = new Set<number>();
    const cursor = new Date(normalizedStart);
    while (cursor <= normalizedEnd) {
      uniqueWeekdays.add(cursor.getUTCDay());
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return Array.from(uniqueWeekdays);
  }

  private getDatesBetween(start: Date, end: Date): Date[] {
    const normalizedStart = this.normalizeDate(start);
    const normalizedEnd = this.normalizeDate(end);

    if (normalizedEnd < normalizedStart) {
      return [];
    }

    const dates: Date[] = [];
    const cursor = new Date(normalizedStart);
    while (cursor <= normalizedEnd) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }

  private normalizeDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private toDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private validateTimeOrder(start: string, end: string) {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException(
        'startTime must be earlier than endTime for availability slots',
      );
    }
  }

  private ensureWithinClinicHours(
    start: string,
    end: string,
    open: string,
    close: string,
  ) {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    const openMinutes = this.timeToMinutes(open);
    const closeMinutes = this.timeToMinutes(close);

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      throw new BadRequestException(
        `Availability slots must fall between ${open} and ${close}`,
      );
    }
  }

  private async ensureNoOverlap(
    doctorId: string,
    weekday: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const existing = await this.doctorAvailabilityRepository.find({
      where: { doctorId, weekday },
    });

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    for (const slot of existing) {
      if (excludeId && slot.id === excludeId) continue;
      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);

      const overlaps = startMinutes < slotEnd && endMinutes > slotStart;
      if (overlaps) {
        throw new BadRequestException(
          'Availability slot overlaps with existing schedule',
        );
      }
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map((value) => Number(value));
    return hours * 60 + minutes;
  }

  private dateToUtcTimeString(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

export interface AvailabilitySlotSnapshot {
  startTime: string;
  endTime: string;
  source: 'recurring' | 'extra';
  reason?: string;
  clinicId?: string;
  notes?: string;
}

export interface DailyAvailabilitySnapshot {
  date: string;
  weekday: number;
  slots: AvailabilitySlotSnapshot[];
  exceptions: DoctorAvailabilityException[];
}

export interface DoctorAvailabilityCheckResult {
  available: boolean;
  reason?: string;
}
