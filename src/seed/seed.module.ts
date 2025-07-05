import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../patient/entities/patient.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Admin } from '../admin/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Profile, Doctor, Admin])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
