import { Module } from '@nestjs/common';
import {HttpModule} from "@nestjs/axios";

import { TelegramProvider } from './telegram.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { User } from '../User/user.entity';
import { UserService } from '../User/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
  ],
  controllers: [],
  providers: [TelegramProvider, UserService],
})
export class TelegramModule {}
