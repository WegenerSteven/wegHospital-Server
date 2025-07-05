import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from './entities/profile.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { AtGuard } from 'src/auth/guards';
import { /*ApiBearerAuth*/ ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('profiles')
@UseGuards(RolesGuard, AtGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Public() //custom decorators
  @Post()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter profiles by email',
  })
  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get()
  findAll(@Query('email') email?: string) {
    return this.profilesService.findAll(email);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, updateProfileDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // Ensure that only admins can delete profiles
    return this.profilesService.remove(id);
  }
}
