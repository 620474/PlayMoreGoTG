import { Injectable } from '@nestjs/common';
import { Hears, Help, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Context, Telegraf } from 'telegraf';

@Update()
@Injectable()
export class AppService {}