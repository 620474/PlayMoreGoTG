import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Context, Telegraf } from 'telegraf';
import { Hears, Help, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';

@Update()
export class AppProvider {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>, private readonly appService: AppService) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Welcome');
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async onSticker(ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hearsHi(ctx) {
    console.log(this.bot)
    await ctx.reply('Hey there');
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async runCronEvery30Seconds() {
    await this.bot.telegram.sendMessage(7071374541, 'test bot')
    };
}
