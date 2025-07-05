import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DoctorService } from '../doctor/doctor.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Doctor } from '../doctor/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Profile, Doctor]) /*CaslModule*/],
  controllers: [AdminController],
  providers: [AdminService, DoctorService],
  exports: [TypeOrmModule],
})
export class AdminModule {}
