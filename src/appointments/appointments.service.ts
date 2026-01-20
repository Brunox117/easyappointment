import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { Clinic } from 'src/clinic/entities/clinic.entity';
import { User } from 'src/auth/entities/user.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleErrors } from 'src/utilities/helpers/handle-errors';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    this.logger.log(`[Create appointment] starting...`);
    try {
      // Validate that the referenced clinic exists
      const clinicId = createAppointmentDto.clinicId;
      if (clinicId) {
        const clinic = await this.clinicRepository.findOne({
          where: { id: clinicId },
        });
        if (!clinic) {
          throw new NotFoundException(`Clinic with id ${clinicId} not found`);
        }
      }

      // Validate that the referenced doctor exists
      const doctorId = createAppointmentDto.doctorId;
      if (doctorId) {
        const doctor = await this.userRepository.findOne({
          where: { id: doctorId },
        });
        if (!doctor) {
          throw new NotFoundException(`Doctor with id ${doctorId} not found`);
        }
      }

      // Validate that the referenced patient exists
      const patientId = createAppointmentDto.patientId;
      if (patientId) {
        const patient = await this.patientRepository.findOne({
          where: { id: patientId },
        });
        if (!patient) {
          throw new NotFoundException(`Patient with id ${patientId} not found`);
        }
      }

      const appointment =
        this.appointmentRepository.create(createAppointmentDto);

      this.logger.log('Creating appointment...');
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findAll() {
    try {
      this.logger.log('Finding all appointments...');
      return await this.appointmentRepository.find();
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log('Finding one appointment...');
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
      });
      if (!appointment) {
        throw new NotFoundException(`Appointment with id ${id} not found`);
      }
      return appointment;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    // If clinicId is being updated, validate the new clinic exists
    const newClinicId = updateAppointmentDto.clinicId;
    if (newClinicId) {
      const clinic = await this.clinicRepository.findOne({
        where: { id: newClinicId },
      });
      if (!clinic) {
        throw new NotFoundException(`Clinic with id ${newClinicId} not found`);
      }
    }

    // If doctorId is being updated, validate the new doctor exists
    const newDoctorId = updateAppointmentDto.doctorId;
    if (newDoctorId) {
      const doctor = await this.userRepository.findOne({
        where: { id: newDoctorId },
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with id ${newDoctorId} not found`);
      }
    }

    // If patientId is being updated, validate the new patient exists
    const newPatientId = updateAppointmentDto.patientId;
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

    try {
      this.logger.log('Updating appointment...');
      const result = await this.appointmentRepository.update(
        id,
        updateAppointmentDto,
      );
      if (result.affected === 0) {
        throw new NotFoundException(`Appointment with id ${id} not found`);
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      this.logger.log('Removing appointment...');
      const result = await this.appointmentRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Appointment with id ${id} not found`);
      }
      return { message: 'Appointment removed successfully' };
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
