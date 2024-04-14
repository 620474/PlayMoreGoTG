import { ConfigService } from '@nestjs/config';
import { TelegrafModuleAsyncOptions, TelegrafModuleOptions } from 'nestjs-telegraf';

const telegrafModuleOptions = (config: ConfigService): TelegrafModuleOptions => {
    return {
        token: config.get('6794182120:AAG9LTNKIz28BL13Y5agPquWM_wldTfE88Y'),
    };
};

export const options = (): TelegrafModuleAsyncOptions => {
    return {
        inject: [ConfigService],
        useFactory: (config: ConfigService) => telegrafModuleOptions(config),
    };
};