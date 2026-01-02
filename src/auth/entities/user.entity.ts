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

  // NOTE: In a future iteration, doctors will be represented as Users with the role 'doctor'.
  // This field is introduced now to support that migration path.
  @Column('text', { nullable: true })
  phoneNumber?: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctors, { nullable: true })
  clinic?: Clinic;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments?: Appointment[];

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @BeforeInsert()
  @BeforeUpdate()
  checkFieldBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }
}
