import { Injectable, Logger } from '@nestjs/common';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { ConversationService } from 'src/conversation/conversation.service';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { LlmServiceService } from 'src/llm-service/llm-service.service';
import { MessageService } from 'src/message/message.service';
import { PatientsService } from 'src/patients/patients.service';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { Context } from 'telegraf';
import { Patient } from 'src/patients/entities/patient.entity';

//Special telegraf decorator to handle telegram updates
const DEFAULT_TELEGRAM_CLINIC_ID =
  process.env.TELEGRAM_DEFAULT_CLINIC_ID ??
  '7b94feb0-5db7-4c5e-b090-4238cdc0fb70';

@Update()
@Injectable()
export class TelegramIntegrationService {
  private readonly logger = new Logger(TelegramIntegrationService.name);
  private readonly defaultClinicId = DEFAULT_TELEGRAM_CLINIC_ID;
  constructor(
    private readonly llmService: LlmServiceService,
    private readonly conversationService: ConversationService,
    private readonly patientService: PatientsService,
    private readonly messageService: MessageService,
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
      const messageText = this.getMessageText(message);
      if (!messageText) {
        this.logger.debug('Skipping update because there is no text payload');
        return;
      }

      const chatId = ctx.chat?.id?.toString();
      if (!chatId) {
        this.logger.warn('Telegram update missing chat id, ignoring message');
        return;
      }

      const patient = await this.getOrCreatePatient(chatId);
      const conversation = await this.getOrCreateConversation(patient.id);

      await this.messageService.create({
        conversationId: conversation.id,
        content: messageText,
        fromPatient: true,
      });

      const response = await this.llmService.chat(messageText);
      if (response) {
        await ctx.reply(response);
      }
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  private getMessageText(message: Context['message'] | undefined) {
    if (!message || typeof message !== 'object') {
      return undefined;
    }
    const payloadText = 'text' in message ? message.text : undefined;
    if (!payloadText || typeof payloadText !== 'string') {
      return undefined;
    }
    const trimmed = payloadText.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }

  private async getOrCreatePatient(chatId: string): Promise<Patient> {
    const existingPatient = await this.patientService.findOneByNumber(chatId);
    if (existingPatient) {
      return existingPatient;
    }

    const createdPatient = await this.patientService.create({
      name: 'Unknown',
      phoneNumber: chatId,
      clinicId: this.defaultClinicId,
    });
    if (!createdPatient) {
      throw new Error('Unable to create patient for Telegram chat');
    }

    return createdPatient;
  }

  private async getOrCreateConversation(
    patientId: string,
  ): Promise<Conversation> {
    const existingConversation =
      await this.conversationService.findOneByPatientId(patientId);
    if (existingConversation) {
      return existingConversation;
    }

    const createdConversation = await this.conversationService.create({
      patientId,
    });
    if (!createdConversation) {
      throw new Error('Unable to create conversation for Telegram chat');
    }

    return createdConversation;
  }
}
