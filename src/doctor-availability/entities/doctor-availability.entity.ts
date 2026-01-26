import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Clinic } from '../../clinic/entities/clinic.entity';

@Entity('doctor_availabilities')
@Index(['doctorId', 'weekday'])
export class DoctorAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  doctorId: string;

  @ManyToOne(() => User, (user) => user.doctorAvailabilities, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column('int')
  weekday: number;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column('bool', { default: true })
  isRecurring: boolean;

  @Column('uuid', { nullable: true })
  clinicId?: string;

  @ManyToOne(() => Clinic, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'clinicId' })
  clinic?: Clinic;

  @Column('text', { nullable: true })
  locationId?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
