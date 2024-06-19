import { Context, Telegraf } from 'telegraf';
import { HttpService } from '@nestjs/axios';
import { InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UserService } from '../User/user.service';
import { adminsArray } from '../constants/admin';

@Update()
export class TelegramProvider {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
    private readonly http: HttpService,
  ) {}

  @Start()
  async startCommand(ctx) {
    const { from, text } = ctx.update?.message;
    const { id, first_name, last_name } = from;
    const PmgId = text.split(' ')[1];

    const res = await this.userService.findByTelegramId(id);
    if (res?.id) {
      await ctx.reply('Добро пожаловать обратно', first_name);
    } else if (id) {
      await this.userService.create({
        telegramId: id,
        name: first_name,
        lastname: last_name,
        playMoreGoID: PmgId,
      });
      await ctx.reply('Добро пожаловать', first_name);
    }
  }

  // 0 - минут, 15 - часов, каждый день
  @Cron('0 15 * * *')
  async runCronEvery30Seconds() {
    const users = await this.userService.finaAll();
    if (users.length > 0) {
      users.map(async (user) => {
        const testAxios = await this.http
          .get(`https://playmorego.org/api/v1/player-profiles?id=${user.telegramId}&app_key=tg-b4c2d90178c`)
          .toPromise();
        await this.bot.telegram.sendMessage(
          user.telegramId,
          `${testAxios.status}`,
        );
      });
    }
  }

  @On('text')
  async onMessage(ctx) {
    const message = ctx.message?.text;

    if (message) {
      const userId = ctx.from.id;

      if (!adminsArray.includes(userId)) {
        return ctx.reply('Вы не являетесь администратором.');
      }

      if (!message) {
        return ctx.reply('Пожалуйста, укажите сообщение для отправки.');
      }

      const users = await this.userService.finaAll();
      if (users.length > 0) {
        users.map(async (user) => {
          if (user.telegramId !== userId) {
            await this.bot.telegram.sendMessage(user.telegramId, `${message}`);
          }
        });
        ctx.reply('Сообщение отправлено всем пользователям.');
      }
    }
  }
}
