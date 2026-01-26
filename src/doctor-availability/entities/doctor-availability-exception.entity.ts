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

export enum DoctorAvailabilityExceptionType {
  BLOCKED = 'blocked',
  EXTRA_HOURS = 'extraHours',
}

@Entity('doctor_availability_exceptions')
@Index(['doctorId', 'date'])
export class DoctorAvailabilityException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  doctorId: string;

  @ManyToOne(() => User, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column('date')
  date: Date;

  @Column('text')
  type: DoctorAvailabilityExceptionType;

  @Column('text', { nullable: true })
  reason?: string;

  @Column('time', { nullable: true })
  startTime?: string;

  @Column('time', { nullable: true })
  endTime?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
