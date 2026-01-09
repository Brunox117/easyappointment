import { Controller } from '@nestjs/common';
import { LlmServiceService } from './llm-service.service';

@Controller('llm-service')
export class LlmServiceController {
  constructor(private readonly llmServiceService: LlmServiceService) {}
}
