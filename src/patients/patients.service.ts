import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { Clinic } from 'src/clinic/entities/clinic.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleErrors } from 'src/utilities/helpers/handle-errors';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    // Validate that the referenced clinic exists
    const clinicId = createPatientDto.clinicId;
    if (clinicId) {
      const clinic = await this.clinicRepository.findOne({
        where: { id: clinicId },
      });
      if (!clinic) {
        throw new NotFoundException(`Clinic with id ${clinicId} not found`);
      }
    }
    const patient = this.patientRepository.create(createPatientDto);
    try {
      this.logger.log('Creating patient...');
      return await this.patientRepository.save(patient);
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findAll() {
    try {
      this.logger.log('Finding all patients...');
      return await this.patientRepository.find();
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log('Finding one patient...');
      const patient = await this.patientRepository.findOne({ where: { id } });
      if (!patient) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }
      return patient;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findOneByNumber(number: string) {
    try {
      this.logger.log('Finding one patient by number...');
      const patient = await this.patientRepository.findOne({
        where: { phoneNumber: number },
      });
      return patient;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    // If clinicId is being updated, validate the new clinic exists
    const newClinicId = updatePatientDto.clinicId;
    if (newClinicId) {
      const clinic = await this.clinicRepository.findOne({
        where: { id: newClinicId },
      });
      if (!clinic) {
        throw new NotFoundException(`Clinic with id ${newClinicId} not found`);
      }
    }
    try {
      this.logger.log('Updating patient...');
      const result = await this.patientRepository.update(id, updatePatientDto);
      if (result.affected === 0) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      this.logger.log('Removing patient...');
      const result = await this.patientRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }
      return { message: 'Patient removed successfully' };
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
