import { Module } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { Clinic } from './entities/clinic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  controllers: [ClinicController],
  providers: [ClinicService],
  imports: [
    TypeOrmModule.forFeature([
      Clinic,
      User,
      Appointment,
      Patient,
      Conversation,
      Message,
    ]),
  ],
})
export class ClinicModule {}
