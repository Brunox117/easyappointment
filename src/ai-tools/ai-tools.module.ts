import { Module } from '@nestjs/common';
import { AiToolsService } from './ai-tools.service';
import { AiToolsController } from './ai-tools.controller';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
  controllers: [AiToolsController],
  providers: [AiToolsService],
  exports: [AiToolsService],
  imports: [PatientsModule],
})
export class AiToolsModule {}
