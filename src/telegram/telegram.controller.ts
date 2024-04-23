import { Context, Telegraf } from 'telegraf';
import { UseMiddleware } from 'nestjs-telegraf';
import {
  Action,
  Hears,
  Help,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../User/user.service';

const add = [
  {
    id: 1,
    name: 'Привязать профиль',
    isCompleted: false,
  },
];

function isAdmin(ctx: Context, next: () => Promise<void>) {
  const user = getUserFromContext(ctx);
  if (user && user.isAdmin) {
    return next();
  } else {
    ctx.reply('You are not authorized to perform this action.');
  }
}

@Update()
export class TelegramProvider {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    console.log(ctx.update);
    await ctx.reply('Welcome');
    await ctx.reply('Привязать');
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async onSticker(ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('Привязать профиль')
  async getUser(ctx: Context) {
    await ctx.reply('Привязано');
  }

  @Hears('Добавить админа')
  async addAdmin(ctx: Context) {
    console.log(ctx)
    await ctx.reply('Привязано');
  }


  @Hears('Послать новость')
  @UseMiddleware(isAdmin)
  async sendNews(ctx: Context) {

    await ctx.reply('Привязано');
  }

  @Hears('hi')
  async hearsHi(ctx) {
    console.log(this.bot);
    await ctx.reply('Hey there');
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async runCronEvery30Seconds() {
    await this.bot.telegram.sendMessage(7071374541, 'test bot');
    console.log('Message sent');
  }
}
