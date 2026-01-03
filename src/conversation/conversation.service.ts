import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Conversation } from './entities/conversation.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleErrors } from 'src/utilities/helpers/handle-errors';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createConversationDto: CreateConversationDto) {
    // Validate that the referenced patient exists
    const patientId = createConversationDto.patientId;
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${patientId} not found`);
    }

    // Validate that the referenced appointment exists
    const appointmentId = createConversationDto.appointmentId;
    if (appointmentId) {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
      });
      if (!appointment) {
        throw new NotFoundException(
          `Appointment with id ${appointmentId} not found`,
        );
      }
    }

    const conversation = this.conversationRepository.create(
      createConversationDto,
    );
    try {
      this.logger.log('Creating conversation...');
      return await this.conversationRepository.save(conversation);
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findAll() {
    try {
      this.logger.log('Finding all conversations...');
      return await this.conversationRepository.find();
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log('Finding one conversation...');
      const conversation = await this.conversationRepository.findOne({
        where: { id },
      });
      if (!conversation) {
        throw new NotFoundException(`Conversation with id ${id} not found`);
      }
      return conversation;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async update(id: string, updateConversationDto: UpdateConversationDto) {
    // If patientId is being updated, validate the new patient exists
    const newPatientId = updateConversationDto.patientId;
    if (newPatientId) {
      const patient = await this.patientRepository.findOne({
        where: { id: newPatientId },
      });
      if (!patient) {
        throw new NotFoundException(
          `Patient with id ${newPatientId} not found`,
        );
      }
    }

    // If appointmentId is being updated, validate the new appointment exists
    const newAppointmentId = updateConversationDto.appointmentId;
    if (newAppointmentId) {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: newAppointmentId },
      });
      if (!appointment) {
        throw new NotFoundException(
          `Appointment with id ${newAppointmentId} not found`,
        );
      }
    }

    try {
      this.logger.log('Updating conversation...');
      const result = await this.conversationRepository.update(
        id,
        updateConversationDto,
      );
      if (result.affected === 0) {
        throw new NotFoundException(`Conversation with id ${id} not found`);
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      this.logger.log('Removing conversation...');
      const result = await this.conversationRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Conversation with id ${id} not found`);
      }
      return { message: 'Conversation removed successfully' };
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
