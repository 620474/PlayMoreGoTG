import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(telegramId: number, name: string): Promise<User> {
    const user = new User();
    user.telegramId = telegramId;
    user.name = name;
    return this.usersRepository.save(user);
  }

  async findByTelegramId(telegramId: number): Promise<User> {
    // @ts-ignore
    return this.usersRepository.findOne({ telegramId });
  }

  async setAdmin(telegramId: number): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    user.isAdmin = true;
    return this.usersRepository.save(user);
  }
}
