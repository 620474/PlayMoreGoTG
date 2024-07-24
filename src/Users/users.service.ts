import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';

interface IUser {
  telegramId: number;
  name: string;
  lastname: string;
  isAdmin?: boolean;
  playMoreGoID: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users, 'usersConnection')
    private usersRepository: Repository<Users>,
  ) {}

  async create(data: IUser): Promise<Users> {
    const { telegramId, playMoreGoID, name, lastname, isAdmin } = data;

    if (telegramId && name && playMoreGoID) {
      const user = new Users();
      user.telegramId = telegramId;
      user.playMoreGoID = playMoreGoID;
      user.name = name;
      user.lastname = lastname;
      user.isAdmin = isAdmin;
      return this.usersRepository.save(user);
    }
  }

  async findByTelegramId(telegramId: number): Promise<Users> {
    return this.usersRepository.findOneBy({ telegramId });
  }

  async finaAll(): Promise<Users[]> {
    return this.usersRepository.find();
  }
}
