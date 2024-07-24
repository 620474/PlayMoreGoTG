import { OnModuleInit, HttpException, Injectable, Logger } from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Context, Telegraf } from 'telegraf';
import { LessThanOrEqual, MoreThanOrEqual, Not, Between, Equal } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { InjectBot, On, Start, Update, Command } from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../Users/users.service';
import { adminsArray } from '../constants/admin';
import { Users } from '../Users/users.entity';
import { Divisions } from '../Users/divisions.entity';
import { Members } from '../Users/members.entity';

@Injectable()
@Update()
export class TelegramProvider implements OnModuleInit {
  private readonly logger = new Logger(TelegramProvider.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly usersService: UsersService,
    @InjectRepository(Users, 'usersConnection')
    private usersRepository: Repository<Users>,
    @InjectRepository(Divisions, 'gameConnection')
    private divisionsRepository: Repository<Divisions>,
    @InjectRepository(Members, 'gameConnection')
    private membersRepository: Repository<Members>
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

    const res = await this.usersService.findByTelegramId(id);
    if (res?.id) {
      await ctx.reply(`Привет!
 
Я рад приветствовать тебя в нашей го-школе. Здесь ты пройдёшь путь от того, кто только интересуется самой древней и главной игрой, когда-либо созданной человечеством (хотя есть версия, что её нам подарили Боги), до Игрока (с большой буквы).
 
Я Гобот - помощник всех тренеров го-школы. Я буду делать за них важную работу - следить за тем, чтобы твоё познание игры было системным, и тренера могли уделить тебе больше времени в офлайне.
 
Помни! Работа с материалами, которые я буду тебе присылать, посещение занятий в го-школе, турнирная и самостоятельная игровые практики - это фундамент твоего дворца знаний об игре, убери что-то одно, и он пошатнётся.
 
Но вместе мы точно справимся, начнём!`);
    } else if (id) {
      await this.usersService.create({
        telegramId: id,
        name: first_name,
        lastname: last_name,
        playMoreGoID: PmgId,
      });
      await ctx.reply(`Привет!
 
Я рад приветствовать тебя в нашей го-школе. Здесь ты пройдёшь путь от того, кто только интересуется самой древней и главной игрой, когда-либо созданной человечеством (хотя есть версия, что её нам подарили Боги), до Игрока (с большой буквы).
 
Я Гобот - помощник всех тренеров го-школы. Я буду делать за них важную работу - следить за тем, чтобы твоё познание игры было системным, и тренера могли уделить тебе больше времени в офлайне.
 
Помни! Работа с материалами, которые я буду тебе присылать, посещение занятий в го-школе, турнирная и самостоятельная игровые практики - это фундамент твоего дворца знаний об игре, убери что-то одно, и он пошатнётся.
 
Но вместе мы точно справимся, начнём!`);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async runCronEvery30Seconds() {
    const users = await this.usersService.finaAll();
    if (users.length > 0) {
      for (const user of users) {
        try {
          const member = await this.membersRepository.findOne({ where: { user_id: user.playMoreGoID } });
          if (!member) {
            continue;
          }

          const divisions = await this.divisionsRepository.findOne({
            where: {
              min_rating: LessThanOrEqual(member.rating),
              max_rating: MoreThanOrEqual(member.rating)
            }
          });

          if (!divisions) {
            continue;
          }

          const matchingMembers = await this.membersRepository
          .createQueryBuilder('member')
          .where('member.user_id != :userId', { userId: user.playMoreGoID })
          .andWhere('member.rating BETWEEN :minRating AND :maxRating', {
            minRating: divisions.min_rating,
            maxRating: divisions.max_rating
          })
          .orderBy('RAND()')
          .limit(5)
          .getMany();

          let message = 'Добрый тебе день!\n\nСистемная практика - важная часть познания игры. А для игры, как известно, нужны двое.\n\nСегодня я подобрал тебе соперников, вот они:\n\n';
          matchingMembers.forEach(matchingMember => {
            message += `<a href="https://playmorego.org/profile/user/${matchingMember.user_id}">${matchingMember.first_name} ${matchingMember.last_name}</a>\n\n`;
          });
          message+='Перейди по ссылке в профиль игрока на playmorego.org и свяжись в соц.сети, которую игроки оставили для связи с ними\n\n'
          
          message+='Обязательно занеси результат партии в нашей <a href="https://playmorego.org">системе</a> регистрации результатов.\n\n'
          message+='Желаю тебе красивой игры!'
          await this.bot.telegram.sendMessage(user.telegramId, message, {
            parse_mode: 'HTML'
          });
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
        const users = await this.usersService.finaAll();
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
