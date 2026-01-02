import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('clinic')
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  // Future migration: replace Doctor relation with User (doctor role)
  @OneToMany(() => User, (user) => user.clinic)
  doctors: User[];

  @OneToMany(() => Patient, (patient) => patient.clinic)
  patients: Patient[];

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments?: Appointment[];
}
