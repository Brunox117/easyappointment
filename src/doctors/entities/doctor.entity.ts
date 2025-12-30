import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Clinic } from '../../clinic/entities/clinic.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('doctor')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  whatsappNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctors)
  clinic: Clinic;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments?: Appointment[];
}
