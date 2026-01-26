import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateDoctorAvailabilityDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @IsString()
  @Matches(timeRegex, { message: 'startTime must use HH:mm format' })
  startTime: string;

  @IsString()
  @Matches(timeRegex, { message: 'endTime must use HH:mm format' })
  endTime: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsUUID()
  @IsOptional()
  clinicId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
