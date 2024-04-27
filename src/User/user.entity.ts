import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'bigint' })
  telegramId: number;

  @Column({ unique: true, type: 'bigint' })
  playMoreGoID: number;

  @Column()
  name: string;

  @Column({ nullable: true, default: 'user' })
  lastname: string;

  @Column({ default: true })
  tsumego: boolean;

  @Column({ default: true })
  enemy: boolean;

  @Column({ default: false })
  isAdmin: boolean;
}
