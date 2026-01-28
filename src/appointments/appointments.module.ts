import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Clinic } from 'src/clinic/entities/clinic.entity';
import { User } from 'src/auth/entities/user.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { DoctorAvailabilityModule } from 'src/doctor-availability/doctor-availability.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Clinic, User, Patient]),
    DoctorAvailabilityModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
