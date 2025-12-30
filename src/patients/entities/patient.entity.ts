import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Clinic } from '../../clinic/entities/clinic.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.patients)
  @JoinColumn({ name: 'clinicId' })
  clinic?: Clinic;

  @Column()
  name: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments?: Appointment[];
}
