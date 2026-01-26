import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { UpdateDoctorAvailabilityDto } from './dto/update-doctor-availability.dto';

@Injectable()
export class DoctorAvailabilityService {
  private readonly logger = new Logger(DoctorAvailabilityService.name);
  private static readonly CLINIC_OPEN_TIME = '06:00';
  private static readonly CLINIC_CLOSE_TIME = '22:00';

  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly doctorAvailabilityRepository: Repository<DoctorAvailability>,
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

  private getWeekdaysBetween(start: Date, end: Date): number[] {
    const normalizedStart = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
    const normalizedEnd = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
    );

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
}
