import { Module } from '@nestjs/common';
import {HttpModule} from "@nestjs/axios";

import { TelegramProvider } from './telegram.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { Users } from '../Users/users.entity';
import { UsersService } from '../Users/users.service';
import  {Divisions} from '../Users/divisions.entity'
import  {Members} from '../Users/members.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Users], 'usersConnection'),
    TypeOrmModule.forFeature([Divisions, Members], 'gameConnection'),
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
  ],
  controllers: [],
  providers: [TelegramProvider, UsersService],
})
export class TelegramModule {}
