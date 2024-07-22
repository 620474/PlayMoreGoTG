import { Module } from '@nestjs/common';
import {HttpModule} from "@nestjs/axios";

import { TelegramProvider } from './telegram.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { User } from '../User/user.entity';
import { UserService } from '../User/user.service';
import  {Division} from '../User/division.entity'
import  {Member} from '../User/member.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'userConnection'),
    TypeOrmModule.forFeature([Division, Member], 'gameConnection'),
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
