import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiToolsService } from './ai-tools.service';
import { CreateAiToolDto } from './dto/create-ai-tool.dto';
import { UpdateAiToolDto } from './dto/update-ai-tool.dto';

@Controller('ai-tools')
export class AiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}

  @Post()
  create(@Body() createAiToolDto: CreateAiToolDto) {
    return this.aiToolsService.create(createAiToolDto);
  }

  @Get()
  findAll() {
    return this.aiToolsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiToolsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiToolDto: UpdateAiToolDto) {
    return this.aiToolsService.update(+id, updateAiToolDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiToolsService.remove(+id);
  }
}
