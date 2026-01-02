import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment-status.enum';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  clinicId: string;

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
