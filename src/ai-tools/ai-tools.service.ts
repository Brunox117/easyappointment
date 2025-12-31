import { Injectable } from '@nestjs/common';
import { CreateAiToolDto } from './dto/create-ai-tool.dto';
import { UpdateAiToolDto } from './dto/update-ai-tool.dto';

@Injectable()
export class AiToolsService {
  create(createAiToolDto: CreateAiToolDto) {
    return 'This action adds a new aiTool';
  }

  findAll() {
    return `This action returns all aiTools`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiTool`;
  }

  update(id: number, updateAiToolDto: UpdateAiToolDto) {
    return `This action updates a #${id} aiTool`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiTool`;
  }
}
