import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorAvailabilityExceptionDto } from './create-doctor-availability-exception.dto';

export class UpdateDoctorAvailabilityExceptionDto extends PartialType(
  CreateDoctorAvailabilityExceptionDto,
) {}
