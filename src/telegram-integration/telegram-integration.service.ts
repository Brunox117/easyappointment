import { Injectable, Logger } from '@nestjs/common';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { LlmServiceService } from 'src/llm-service/llm-service.service';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { Context } from 'telegraf';

//Special telegraf decorator to handle telegram updates
@Update()
@Injectable()
export class TelegramIntegrationService {
  private readonly logger = new Logger(TelegramIntegrationService.name);
  constructor(private readonly llmService: LlmServiceService) {}
  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Hello, world!');
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    try {
      this.logger.log('Received message from Telegram...');
      const message = ctx.message;
      if (message) {
        const messageText = (message as any).text;
        const response = await this.llmService.chat(messageText);
        if (response) {
          await ctx.reply(response);
        }
      }
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
