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
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { AtGuard, RolesGuard } from 'src/auth/guards';
import { Role } from '../profiles/entities/profile.entity';
@ApiTags('doctors')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Roles(Role.ADMIN, Role.DOCTOR) // Assuming you have a Roles decorator // You can add guards here if needed, e.g., AuthGuard('jwt')
  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get()
  findAll() {
    return this.doctorService.findAll();
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(+id, updateDoctorDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorService.remove(+id);
  }
}
