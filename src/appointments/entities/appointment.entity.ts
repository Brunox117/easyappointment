import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AppointmentStatus } from './appointment-status.enum';
import { Clinic } from '../../clinic/entities/clinic.entity';
import { User } from '../../auth/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Conversation } from '../../conversation/entities/conversation.entity';

@Entity('appointment')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.appointments)
  @JoinColumn({ name: 'clinicId' })
  clinic?: Clinic;

  @Column()
  doctorId: string;

  @ManyToOne(() => User, (user) => user.doctorAppointments)
  @JoinColumn({ name: 'doctorId' })
  doctor?: User;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patientId' })
  patient?: Patient;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  status: AppointmentStatus;

  @OneToMany(() => Conversation, (conversation) => conversation.appointment)
  conversations?: Conversation[];
}
