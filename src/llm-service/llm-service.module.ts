import { Module } from '@nestjs/common';
import { LlmServiceService } from './llm-service.service';
import { LlmServiceController } from './llm-service.controller';
import { AiToolsModule } from '../ai-tools/ai-tools.module';

@Module({
  imports: [AiToolsModule],
  controllers: [LlmServiceController],
  providers: [LlmServiceService],
  exports: [LlmServiceService],
})
export class LlmServiceModule {}
