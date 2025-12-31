import { Module } from '@nestjs/common';
import { WaIntegrationService } from './wa-integration.service';
import { WaIntegrationController } from './wa-integration.controller';

@Module({
  controllers: [WaIntegrationController],
  providers: [WaIntegrationService],
})
export class WaIntegrationModule {}
