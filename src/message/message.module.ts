import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation])],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
