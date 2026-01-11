import { Injectable, Logger } from '@nestjs/common';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { ConversationService } from 'src/conversation/conversation.service';
import { LlmServiceService } from 'src/llm-service/llm-service.service';
import { PatientsService } from 'src/patients/patients.service';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { Context } from 'telegraf';

//Special telegraf decorator to handle telegram updates
@Update()
@Injectable()
export class TelegramIntegrationService {
  private readonly logger = new Logger(TelegramIntegrationService.name);
  constructor(
    private readonly llmService: LlmServiceService,
    private readonly conversationService: ConversationService,
    private readonly patientService: PatientsService,
  ) {}
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
        const chatId = ctx.chat?.id;
        if (chatId) {
          let patient = await this.patientService.findOneByNumber(
            chatId.toString(),
          );
          if (!patient) {
            patient = await this.patientService.create({
              name: 'Unknown',
              phoneNumber: chatId.toString(),
              //TODO: Get clinicId from context
              clinicId: '7b94feb0-5db7-4c5e-b090-4238cdc0fb70',
            });
          }
          console.log(patient);
          const conversation =
            await this.conversationService.findOneByPatientId(
              patient?.id || '',
            );
          if (!conversation) {
            await this.conversationService.create({
              patientId: patient?.id || '',
            });
          }
        }
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
