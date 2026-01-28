import { Module } from '@nestjs/common';
import { AiToolsService } from './ai-tools.service';
import { AiToolsController } from './ai-tools.controller';
import { PatientsModule } from 'src/patients/patients.module';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { DoctorAvailabilityModule } from 'src/doctor-availability/doctor-availability.module';

@Module({
  controllers: [AiToolsController],
  providers: [AiToolsService],
  exports: [AiToolsService],
  imports: [PatientsModule, AppointmentsModule, DoctorAvailabilityModule],
})
export class AiToolsModule {}
