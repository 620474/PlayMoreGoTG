import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,}),
    TelegrafModule.forRoot({
      token: process.env.TG_TOKEN,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}