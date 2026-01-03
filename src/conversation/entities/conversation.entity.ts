import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Message } from '../../message/entities/message.entity';

@Entity('conversation')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.conversations, {
    nullable: false,
  })
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId?: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.conversations, {
    nullable: true,
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment;

  @Column({
    name: 'last_message_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastMessageAt?: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages?: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
