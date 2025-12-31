import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WaIntegrationService } from './wa-integration.service';
import { CreateWaIntegrationDto } from './dto/create-wa-integration.dto';
import { UpdateWaIntegrationDto } from './dto/update-wa-integration.dto';

@Controller('wa-integration')
export class WaIntegrationController {
  constructor(private readonly waIntegrationService: WaIntegrationService) {}

  @Post()
  create(@Body() createWaIntegrationDto: CreateWaIntegrationDto) {
    return this.waIntegrationService.create(createWaIntegrationDto);
  }

  @Get()
  findAll() {
    return this.waIntegrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waIntegrationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWaIntegrationDto: UpdateWaIntegrationDto) {
    return this.waIntegrationService.update(+id, updateWaIntegrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.waIntegrationService.remove(+id);
  }
}
