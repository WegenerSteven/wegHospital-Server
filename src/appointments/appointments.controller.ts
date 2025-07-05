import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/profiles/entities/profile.entity';
import { AtGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT) // Assuming you have a Roles decorator
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT) // Assuming you have a Roles decorator
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT) // Assuming you have a Roles decorator
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR) // Assuming you have a Roles decorator
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR) // Assuming you have a Roles decorator
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
