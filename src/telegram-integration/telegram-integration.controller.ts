import { Controller } from '@nestjs/common';
import { TelegramIntegrationService } from './telegram-integration.service';

@Controller('telegram-integration')
export class TelegramIntegrationController {
  constructor(
    private readonly telegramIntegrationService: TelegramIntegrationService,
  ) {}
}
