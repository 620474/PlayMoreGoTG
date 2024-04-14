import { TelegrafExceptionFilter } from './telegraf-exception.filter';
import { HttpService } from '@nestjs/axios';
import { UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Observable, filter, map, mergeMap, tap } from 'rxjs';
import { Scenes, Telegraf } from 'telegraf';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context extends Scenes.SceneContext {}

@Update()
@UseFilters(TelegrafExceptionFilter)
export class TelegramService extends Telegraf {
    private _token: string;
    constructor(
        private readonly config: ConfigService,
        private readonly httpService: HttpService,
    ) {
        super(config.get('6794182120:AAG9LTNKIz28BL13Y5agPquWM_wldTfE88Y'));
        this._token = config.get('6794182120:AAG9LTNKIz28BL13Y5agPquWM_wldTfE88Y');
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply('Привет в чате с ChatGPT!');
    }

    @On('text')
    onMessage(@Message('text') text: string) {
        return 'hi';
    }
}