import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

interface IUser {
  telegramId: number;
  name: string;
  lastname: string;
  isAdmin?: boolean;
  playMoreGoID: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: IUser): Promise<User> {
    const { telegramId, playMoreGoID, name, lastname, isAdmin } = data;

    if (telegramId && name && playMoreGoID) {
      const user = new User();
      user.telegramId = telegramId;
      user.playMoreGoID = playMoreGoID;
      user.name = name;
      user.lastname = lastname;
      user.isAdmin = isAdmin;
      console.log('user', user);
      return this.usersRepository.save(user);
    }
  }

  async findByTelegramId(telegramId: number): Promise<User> {
    return this.usersRepository.findOneBy({ telegramId });
  }

  async finaAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
