import { OnModuleInit, HttpException, Injectable, Logger } from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Context, Telegraf } from 'telegraf';
import { LessThanOrEqual, MoreThanOrEqual, Not, Between, Equal } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { InjectBot, On, Start, Update, Command } from 'nestjs-telegraf';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../User/user.service';
import { adminsArray } from '../constants/admin';
import { User } from '../User/user.entity';
import { Division } from '../User/division.entity';
import { Member } from '../User/member.entity';

@Injectable()
@Update()
export class TelegramProvider implements OnModuleInit {
  private readonly logger = new Logger(TelegramProvider.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
    @InjectRepository(User, 'userConnection')
    private userRepository: Repository<User>,
    @InjectRepository(Division, 'gameConnection')
    private divisionRepository: Repository<Division>,
    @InjectRepository(Member, 'gameConnection')
    private memberRepository: Repository<Member>
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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async runCronEvery30Seconds() {
    const users = await this.userService.finaAll();
    if (users.length > 0) {
      for (const user of users) {
        try {
          const member = await this.memberRepository.findOne({ where: { user_id: user.playMoreGoID } });
          if (!member) {
            continue;
          }

          const division = await this.divisionRepository.findOne({
            where: {
              min_rating: LessThanOrEqual(member.rating),
              max_rating: MoreThanOrEqual(member.rating)
            }
          });

          if (!division) {
            continue;
          }

          const matchingMembers = await this.memberRepository
          .createQueryBuilder('member')
          .where('member.user_id != :userId', { userId: user.playMoreGoID })
          .andWhere('member.rating BETWEEN :minRating AND :maxRating', {
            minRating: division.min_rating,
            maxRating: division.max_rating
          })
          .orderBy('RAND()')
          .limit(5)
          .getMany();

          let message = 'Добрый тебе день!\n\nСистемная практика - важная часть познания игры. А для игры, как известно, нужны двое.\n\nСегодня я подобрал тебе соперников, вот они:\n\n';
          matchingMembers.forEach(matchingMember => {
            message += `${matchingMember.first_name} ${matchingMember.last_name}\n`;
            message += `https://playmorego.org/profile/user/${matchingMember.user_id}\n\n`;
          });
          message+='Перейди по ссылке в профиль игрока на playmorego.org и свяжись в соц.сети, которую игроки оставили для связи с ними\n\n'
          
          message+='Обязательно занеси результат партии в нашей системе (слово системе это ссылка playmorego.org) регистрации результатов.\n\n'
          message+='Желаю тебе красивой игры!'
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
