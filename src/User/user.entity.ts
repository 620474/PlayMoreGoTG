import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegramId: number;

  @Column({ unique: true })
  playMoreGoID: number;

  @Column()
  name: string;

  @Column({ default: false })
  isAdmin: boolean;
}
