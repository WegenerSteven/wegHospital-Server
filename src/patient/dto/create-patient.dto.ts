import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({
    description: 'the date of Admission of the patient',
    example: '2023-10-01',
    type: Date,
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfAdmission: Date;

  @ApiProperty({
    description: 'the date of Discharge of the patient',
    example: '2023-10-10',
    type: Date,
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateOfDischarge?: Date;

  @ApiProperty({
    description: 'the date of Birth of the patient',
    example: '1990-01-01',
    type: Date,
  })
  @IsDateString()
  dateOfBirth: Date;

  @ApiProperty({
    description: 'the name of the patient',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'the city of the patient',
    example: 'New York',
    type: String,
  })
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty({
    description: 'the profile ID of the patient',
    example: 1,
    type: Number,
  })
  @IsNumber()
  profileId: number;
}
