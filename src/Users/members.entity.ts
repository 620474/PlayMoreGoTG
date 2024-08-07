import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Members {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  rating: number;
}