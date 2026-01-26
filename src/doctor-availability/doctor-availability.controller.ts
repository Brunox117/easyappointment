import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decoratos';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { UpdateDoctorAvailabilityDto } from './dto/update-doctor-availability.dto';
import { DoctorAvailabilityService } from './doctor-availability.service';

@Controller('doctor-availability')
@Auth(ValidRoles.doctor)
export class DoctorAvailabilityController {
  constructor(
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
  ) {}

  @Get()
  findAll(@GetUser('id') doctorId: string) {
    return this.doctorAvailabilityService.findAllByDoctor(doctorId);
  }

  @Post()
  create(
    @GetUser('id') doctorId: string,
    @Body() createDto: CreateDoctorAvailabilityDto,
  ) {
    return this.doctorAvailabilityService.create(doctorId, createDto);
  }

  @Patch(':id')
  update(
    @GetUser('id') doctorId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateDoctorAvailabilityDto,
  ) {
    return this.doctorAvailabilityService.update(doctorId, id, updateDto);
  }

  @Delete(':id')
  remove(
    @GetUser('id') doctorId: string,
    @Param('id') id: string,
  ) {
    return this.doctorAvailabilityService.remove(doctorId, id);
  }
}
