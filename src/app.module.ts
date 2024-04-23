import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppProvider } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module';
import { TelegramModule } from './Telegram/telegram.module';
import { UserModule } from './User/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    TelegramModule,
    UserModule,
  ],
  controllers: [],
  providers: [AppService, AppProvider],
})
export class AppModule {}
