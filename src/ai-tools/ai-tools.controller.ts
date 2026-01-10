import { Controller } from '@nestjs/common';
import { AiToolsService } from './ai-tools.service';

@Controller('ai-tools')
export class AiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}
}
