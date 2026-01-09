import { PartialType } from '@nestjs/mapped-types';
import { CreateLlmServiceDto } from './create-llm-service.dto';

export class UpdateLlmServiceDto extends PartialType(CreateLlmServiceDto) {}
