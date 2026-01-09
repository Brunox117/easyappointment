import { Module } from '@nestjs/common';
import { LlmServiceService } from './llm-service.service';
import { LlmServiceController } from './llm-service.controller';

@Module({
  controllers: [LlmServiceController],
  providers: [LlmServiceService],
  exports: [LlmServiceService],
})
export class LlmServiceModule {}
