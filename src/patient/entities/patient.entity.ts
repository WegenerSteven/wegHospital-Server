import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  Relation,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('increment')
  patientId: number;

  @Column('date')
  dateOfAdmission: Date;

  @Column('date', { nullable: true })
  dateOfDischarge?: Date;

  @Column('date')
  dateOfBirth: Date;

  @Column('varchar', { length: 255 })
  address: string;

  @Column({ nullable: true })
  city?: string;

  @OneToOne(() => Profile, (profile) => profile.patient, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  profile: Relation<Profile>;

  @OneToOne(() => MedicalHistory, (medicalHistory) => medicalHistory.patient, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  medicalHistory: Relation<MedicalHistory>;
  @OneToMany(() => Appointment, (appointment) => appointment.patient, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  appointments: Appointment[];
}
