import { Context, Telegraf } from 'telegraf';
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

let i = 1;

const add = [
  {
    id: 1,
    name: 'Привязать профиль',
    isCompleted: false,
  },
];

function isAdmin(ctx: Context, next: () => Promise<void>) {
  const user = {};
  if (user && user) {
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
  async startCommand(ctx) {
    const { from, text } = ctx.update?.message;
    const { id, first_name, last_name } = from;

    const res = await this.userService.findByTelegramId(id);
    if (res?.id) {
      await ctx.reply(`Добро пожаловать обратно ${first_name} ${last_name}`);
    } else if (id) {
      const result = this.userService.create({
        telegramId: id,
        name: first_name,
        lastname: last_name,
        playMoreGoID: 4,
      });
      await ctx.reply(`Добро пожаловать ${first_name} ${last_name}`);
    }
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @Hears('*')
  async sendNews(ctx) {
    await ctx.reply('This is an admin command.');
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async runCronEvery30Seconds() {
    await this.bot.telegram.sendMessage(7071374541, 'test bot');
    console.log('Message sent');
  }
}
