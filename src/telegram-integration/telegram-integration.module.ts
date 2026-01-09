import { Module } from '@nestjs/common';
import { TelegramIntegrationService } from './telegram-integration.service';
import { TelegramIntegrationController } from './telegram-integration.controller';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LlmServiceModule } from 'src/llm-service/llm-service.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          throw new Error(
            'TELEGRAM_BOT_TOKEN environment variable is required',
          );
        }
        return {
          token,
        };
      },
    }),
    LlmServiceModule,
  ],
  controllers: [TelegramIntegrationController],
  providers: [TelegramIntegrationService],
})
export class TelegramIntegrationModule {}
