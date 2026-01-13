import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleErrors } from 'src/utilities/helpers/handle-errors';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    // Validate that the referenced conversation exists
    const conversationId = createMessageDto.conversationId;
    if (conversationId) {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });
      if (!conversation) {
        throw new NotFoundException(
          `Conversation with id ${conversationId} not found`,
        );
      }
    }
    const message = this.messageRepository.create(createMessageDto);
    try {
      this.logger.log('Creating message...');
      return await this.messageRepository.save(message);
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findAll() {
    try {
      this.logger.log('Finding all messages...');
      return await this.messageRepository.find();
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log('Finding one message...');
      const message = await this.messageRepository.findOne({ where: { id } });
      if (!message) {
        throw new NotFoundException(`Message with id ${id} not found`);
      }
      return message;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    // If conversationId is being updated, validate the new conversation exists
    const newConversationId = updateMessageDto.conversationId;
    if (newConversationId) {
      const conversation = await this.conversationRepository.findOne({
        where: { id: newConversationId },
      });
      if (!conversation) {
        throw new NotFoundException(
          `Conversation with id ${newConversationId} not found`,
        );
      }
    }
    try {
      this.logger.log('Updating message...');
      const result = await this.messageRepository.update(id, updateMessageDto);
      if (result.affected === 0) {
        throw new NotFoundException(`Message with id ${id} not found`);
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      this.logger.log('Removing message...');
      const result = await this.messageRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Message with id ${id} not found`);
      }
      return { message: 'Message removed successfully' };
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findRecentByConversationId(conversationId: string, limit: number) {
    try {
      this.logger.log(
        `Finding recent ${limit} messages for conversation ${conversationId}...`,
      );
      return await this.messageRepository.find({
        where: { conversationId },
        order: { createdAt: 'ASC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
