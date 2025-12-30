import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clinic')
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column()
  status: 'active' | 'suspended';
}
