import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from "@nestjs/schedule";
import { Telegram } from 'telegraf';

@Injectable()
export class CronService {
  private readonly bot: Telegram = new Telegram(process.env.BOT_TOKEN);

  constructor() {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async runCronEvery30Seconds() {
    await this.bot.sendMessage('chat ID','Hello there');
  }
}