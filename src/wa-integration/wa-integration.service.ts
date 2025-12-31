import { Injectable } from '@nestjs/common';
import { CreateWaIntegrationDto } from './dto/create-wa-integration.dto';
import { UpdateWaIntegrationDto } from './dto/update-wa-integration.dto';

@Injectable()
export class WaIntegrationService {
  create(createWaIntegrationDto: CreateWaIntegrationDto) {
    return 'This action adds a new waIntegration';
  }

  findAll() {
    return `This action returns all waIntegration`;
  }

  findOne(id: number) {
    return `This action returns a #${id} waIntegration`;
  }

  update(id: number, updateWaIntegrationDto: UpdateWaIntegrationDto) {
    return `This action updates a #${id} waIntegration`;
  }

  remove(id: number) {
    return `This action removes a #${id} waIntegration`;
  }
}
