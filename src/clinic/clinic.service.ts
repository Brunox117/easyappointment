import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { Clinic } from './entities/clinic.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { PaginationDto } from 'src/utilities/dto/pagination.dto';

@Injectable()
export class ClinicService {
  private readonly logger = new Logger(ClinicService.name);
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}
  async create(createClinicDto: CreateClinicDto) {
    try {
      this.logger.log('Creating clinic...');
      const clinic = this.clinicRepository.create(createClinicDto);
      return await this.clinicRepository.save(clinic);
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      this.logger.log('Finding all clinics...');
      const { limit = 10, offset = 0 } = paginationDto;
      const clinics = await this.clinicRepository.find({
        skip: offset,
        take: limit,
      });
      return clinics;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log('Finding one clinic...');
      const clinic = await this.clinicRepository.findOne({ where: { id } });
      if (!clinic) {
        throw new NotFoundException(`Clinic with id ${id} not found`);
      }
      return clinic;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async update(id: string, updateClinicDto: UpdateClinicDto) {
    try {
      this.logger.log('Updating clinic...');
      const clinic = await this.clinicRepository.update(id, updateClinicDto);
      if (clinic.affected === 0) {
        throw new NotFoundException(`Clinic with id ${id} not found`);
      }
      return clinic;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      this.logger.log('Removing clinic...');
      const clinic = await this.clinicRepository.delete(id);
      if (clinic.affected === 0) {
        throw new NotFoundException(`Clinic with id ${id} not found`);
      }
      return { message: 'Clinic removed successfully' };
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
