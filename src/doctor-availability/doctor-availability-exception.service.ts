import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import {
  DoctorAvailabilityException,
  DoctorAvailabilityExceptionType,
} from './entities/doctor-availability-exception.entity';
import { CreateDoctorAvailabilityExceptionDto } from './dto/create-doctor-availability-exception.dto';
import { UpdateDoctorAvailabilityExceptionDto } from './dto/update-doctor-availability-exception.dto';

@Injectable()
export class DoctorAvailabilityExceptionService {
  private readonly logger = new Logger(DoctorAvailabilityExceptionService.name);

  constructor(
    @InjectRepository(DoctorAvailabilityException)
    private readonly exceptionRepository: Repository<DoctorAvailabilityException>,
  ) {}

  async findAllByDoctor(
    doctorId: string,
  ): Promise<DoctorAvailabilityException[] | undefined> {
    try {
      return this.exceptionRepository.find({
        where: { doctorId },
        order: {
          date: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error(
        `[DoctorAvailabilityException] error listing exceptions: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async findByDoctorAndRange(
    doctorId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<DoctorAvailabilityException[] | undefined> {
    try {
      if (!doctorId || !rangeStart || !rangeEnd) {
        return [];
      }

      const normalizedStart = this.normalizeDate(rangeStart);
      const normalizedEnd = this.normalizeDate(rangeEnd);

      if (normalizedEnd < normalizedStart) {
        return [];
      }

      return this.exceptionRepository.find({
        where: {
          doctorId,
          date: Between(normalizedStart, normalizedEnd),
        },
        order: {
          date: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error(
        `[DoctorAvailabilityException] error finding exceptions: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async create(
    doctorId: string,
    createDto: CreateDoctorAvailabilityExceptionDto,
  ): Promise<DoctorAvailabilityException | undefined> {
    try {
      const normalizedDate = this.normalizeDate(createDto.date);
      this.ensureExceptionTimes(
        createDto.type,
        createDto.startTime,
        createDto.endTime,
      );

      const exception = this.exceptionRepository.create({
        doctorId,
        ...createDto,
        date: normalizedDate,
      });

      return this.exceptionRepository.save(exception);
    } catch (error) {
      this.logger.error(
        `[DoctorAvailabilityException] error creating exception: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async update(
    doctorId: string,
    id: string,
    updateDto: UpdateDoctorAvailabilityExceptionDto,
  ): Promise<DoctorAvailabilityException | undefined> {
    try {
      const exception = await this.exceptionRepository.findOne({
        where: { id, doctorId },
      });
      if (!exception) {
        throw new NotFoundException(
          `Exception ${id} not found for doctor ${doctorId}`,
        );
      }

      const targetType =
        updateDto.type === undefined ? exception.type : updateDto.type;
      const targetStart =
        updateDto.startTime === undefined
          ? exception.startTime
          : updateDto.startTime;
      const targetEnd =
        updateDto.endTime === undefined ? exception.endTime : updateDto.endTime;
      const targetDate =
        updateDto.date === undefined
          ? exception.date
          : this.normalizeDate(updateDto.date);

      this.ensureExceptionTimes(targetType, targetStart, targetEnd);

      Object.assign(exception, {
        ...updateDto,
        type: targetType,
        startTime: targetStart,
        endTime: targetEnd,
        date: targetDate,
      });

      return this.exceptionRepository.save(exception);
    } catch (error) {
      this.logger.error(
        `[DoctorAvailabilityException] error updating exception: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  async remove(doctorId: string, id: string) {
    try {
      const exception = await this.exceptionRepository.findOne({
        where: { id, doctorId },
      });
      if (!exception) {
        throw new NotFoundException(
          `Exception ${id} not found for doctor ${doctorId}`,
        );
      }

      await this.exceptionRepository.remove(exception);
      return { message: 'Exception removed successfully' };
    } catch (error) {
      this.logger.error(
        `[DoctorAvailabilityException] error removing exception: ${JSON.stringify(
          error,
        )}`,
      );
      handleErrors(error);
    }
  }

  private ensureExceptionTimes(
    type: DoctorAvailabilityExceptionType,
    startTime?: string,
    endTime?: string,
  ) {
    if (type === DoctorAvailabilityExceptionType.EXTRA_HOURS) {
      if (!startTime || !endTime) {
        throw new BadRequestException(
          'Extra hours exceptions require startTime and endTime',
        );
      }
      this.validateTimeOrder(startTime, endTime);
      return;
    }

    if (startTime || endTime) {
      throw new BadRequestException(
        'Blocked-day exceptions cannot define extra hours',
      );
    }
  }

  private normalizeDate(value: string | Date): Date {
    const parsed = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()),
    );
  }

  private validateTimeOrder(start: string, end: string) {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException(
        'startTime must be earlier than endTime for extra hours',
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map((value) => Number(value));
    return hours * 60 + minutes;
  }
}
