import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { DoctorAvailabilityExceptionType } from '../entities/doctor-availability-exception.entity';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateDoctorAvailabilityExceptionDto {
  @IsDateString()
  date: string;

  @IsEnum(DoctorAvailabilityExceptionType)
  type: DoctorAvailabilityExceptionType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @Matches(timeRegex, { message: 'startTime must use HH:mm format' })
  @IsOptional()
  startTime?: string;

  @IsString()
  @Matches(timeRegex, { message: 'endTime must use HH:mm format' })
  @IsOptional()
  endTime?: string;
}
