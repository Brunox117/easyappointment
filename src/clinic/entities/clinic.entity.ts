import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
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

  @Column({ type: 'varchar', length: 255 })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Doctor, (doctor) => doctor.clinic)
  doctors: Doctor[];

  @OneToMany(() => Patient, (patient) => patient.clinic)
  patients: Patient[];

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments?: Appointment[];
}
