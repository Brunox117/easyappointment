import { PartialType } from '@nestjs/mapped-types';
import { CreateWaIntegrationDto } from './create-wa-integration.dto';

export class UpdateWaIntegrationDto extends PartialType(
  CreateWaIntegrationDto,
) {}
