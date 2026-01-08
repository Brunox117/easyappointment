import { Injectable } from '@nestjs/common';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

//Special telegraf decorator to handle telegram updates
@Update()
@Injectable()
export class TelegramIntegrationService {
  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Hello, world!');
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    await ctx.reply('Hola desde el servidor!');
  }
}
