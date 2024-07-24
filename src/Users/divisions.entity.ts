import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Divisions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  min_rating: number;

  @Column()
  max_rating: number;
}