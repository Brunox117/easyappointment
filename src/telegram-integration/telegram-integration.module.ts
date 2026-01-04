import { Module } from '@nestjs/common';
import { TelegramIntegrationService } from './telegram-integration.service';
import { TelegramIntegrationController } from './telegram-integration.controller';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN ?? '',
    }),
  ],
  controllers: [TelegramIntegrationController],
  providers: [TelegramIntegrationService],
})
export class TelegramIntegrationModule {}
