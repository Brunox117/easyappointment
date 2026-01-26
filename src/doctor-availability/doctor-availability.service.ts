import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { handleErrors } from 'src/utilities/helpers/handle-errors';

@Injectable()
export class DoctorAvailabilityService {
  private readonly logger = new Logger(DoctorAvailabilityService.name);

  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly doctorAvailabilityRepository: Repository<DoctorAvailability>,
  ) { }

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
        `[DoctorAvailability] error finding by doctor and range: ${JSON.stringify(error)}`,
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
}
