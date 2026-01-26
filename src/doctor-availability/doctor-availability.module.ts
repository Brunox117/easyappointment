import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorAvailabilityException } from './entities/doctor-availability-exception.entity';
import { DoctorAvailabilityController } from './doctor-availability.controller';
import { DoctorAvailabilityExceptionService } from './doctor-availability-exception.service';
import { DoctorAvailabilityService } from './doctor-availability.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorAvailability, DoctorAvailabilityException]),
  ],
  controllers: [DoctorAvailabilityController],
  providers: [DoctorAvailabilityService, DoctorAvailabilityExceptionService],
  exports: [DoctorAvailabilityService, DoctorAvailabilityExceptionService],
})
export class DoctorAvailabilityModule {}
