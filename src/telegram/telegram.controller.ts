import { OnModuleInit, HttpException, Injectable, Logger } from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Context, Telegraf } from 'telegraf';
import { HttpService } from '@nestjs/axios';
import { InjectBot, On, Start, Update, Command } from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../User/user.service';
import { adminsArray } from '../constants/admin';

@Injectable()
@Update()
export class TelegramProvider implements OnModuleInit {
  private readonly logger = new Logger(TelegramProvider.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
    private readonly http: HttpService,
  ) {}

  async setBotCommands() {
    await this.bot.telegram.setMyCommands([
      { command: 'sendmessage', description: 'Разослать сообщение' },
    ]);
  }

  async onModuleInit() {
    await this.setBotCommands();
  }

  @Start()
  async startCommand(ctx) {
    const { from, text } = ctx.update?.message;
    const { id, first_name, last_name } = from;
    const PmgId = text.split(' ')[1];

    const res = await this.userService.findByTelegramId(id);
    if (res?.id) {
      await ctx.reply(`Добро пожаловать обратно, ${first_name}`);
    } else if (id) {
      await this.userService.create({
        telegramId: id,
        name: first_name,
        lastname: last_name,
        playMoreGoID: PmgId,
      });
      await ctx.reply(`Добро пожаловать, ${first_name}`);
    }
  }

  @Cron('0 11 * * 6')
  async runCronEvery30Seconds() {
    const users = await this.userService.finaAll();
    if (users.length > 0) {
      for (const user of users) {
        try {
          const res = await this.http
            .get(`https://playmorego.org/api/v1/player-profiles?id=${user.playMoreGoID}&app_key=tg-b4c2d90178c`)
            .pipe(
              catchError(e => {
                this.logger.error(`Error fetching player profiles: ${e.message}`);
                return [];
              }),
            )
            .toPromise();

          let message = 'Вы можете сыграть с этими игроками:\n\n';
          if (res && res.data && res.data.items) {
            res.data.items.forEach(player => {
              message += `${player.first_name} ${player.last_name}\n`;
              message += `${player.profileLink}\n\n`;
            });
          }

          await this.bot.telegram.sendMessage(user.telegramId, message);
        } catch (error) {
          this.logger.error(`Failed to send message to user ${user.telegramId}: ${error.message}`);
        }
      }
    }
  }

  @Command('sendmessage')
  async onMessage(ctx) {
    const message = ctx.message?.text?.split(' ').slice(1).join(' ');

    if (!message && adminsArray.includes(ctx.from.id)) {
      return ctx.reply('Введите пожалуйста сообщение через пробел после команды /sendmessage.');
    }

    if (message) {
      const userId = ctx.from.id;

      if (adminsArray.includes(userId)) {
        const users = await this.userService.finaAll();
        if (users.length > 0) {
          for (const user of users) {
            if (user.telegramId !== userId) {
              try {
                await this.bot.telegram.sendMessage(user.telegramId, message);
              } catch (error) {
                this.logger.error(`Failed to send message to user ${user.telegramId}: ${error.message}`);
              }
            }
          }
          return ctx.reply('Сообщение отправлено всем пользователям.');
        }
      }
    }
  }
}
