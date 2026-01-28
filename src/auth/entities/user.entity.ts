import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Clinic } from '../../clinic/entities/clinic.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { DoctorAvailability } from '../../doctor-availability/entities/doctor-availability.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', { nullable: true })
  phoneNumber?: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctors, { nullable: true })
  clinic?: Clinic;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments?: Appointment[];

  @OneToMany(() => DoctorAvailability, (availability) => availability.doctor)
  doctorAvailabilities?: DoctorAvailability[];

  @Column('text', {
    array: true,
    default: ['doctor'],
  })
  roles: string[];

  @BeforeInsert()
  @BeforeUpdate()
  checkFieldBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }
}
