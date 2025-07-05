import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor) private doctorRespository: Repository<Doctor>,
  ) {}
  async create(createAppointmentDto: CreateAppointmentDto) {
    const existPatient = await this.patientRepository.findOne({
      where: { patientId: createAppointmentDto.patientId },
    });
    if (!existPatient) {
      throw new NotFoundException('Patiend id not found');
    }

    //check if doctor exist
    const existDoctor = await this.doctorRespository.findOne({
      where: { doctorId: createAppointmentDto.doctorId },
    });
    if (!existDoctor) {
      throw new NotFoundException('Doctor id not found');
    }
    const appointment = this.appointmentRepository.create({
      patient: existPatient,
      doctor: existDoctor,
      appointmentDate: createAppointmentDto.appointmentDate,
      status: createAppointmentDto.status,
      notes: createAppointmentDto.notes,
    });

    return this.appointmentRepository.save(appointment);
  }

  findAll() {
    return this.appointmentRepository.find();
  }

  findOne(id: number) {
    return this.appointmentRepository.findOne({ where: { appointmentId: id } });
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentRepository
      .update(id, updateAppointmentDto)
      .then((result) => {
        if (result.affected === 0) {
          return `Appointment with ID ${id} not found`;
        }
      });
  }

  remove(id: number): Promise<void> {
    return this.appointmentRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          throw new Error(`Appointment with ID ${id} not found`);
        }
      })
      .catch((error) => {
        console.error('Error deleting appointment:', error);
        throw new Error('Error deleting appointment');
      });
  }
}
