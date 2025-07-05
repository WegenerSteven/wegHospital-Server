/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/entities/profile.entity';
import { ConfigService } from '@nestjs/config';
import { Admin } from '../admin/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import * as Bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // This service is responsible for handling authentication logic.
  // It will interact with the database to manage user sessions, tokens, etc.
  constructor(
    // Inject any necessary dependencies here, such as a user repository or token service.
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //helper method to generate access and refresh tokens
  private async generateTokens(userId: number, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email: email, role: role },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION', //15min
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
          role: role,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION',
          ),
        },
      ),
    ]);

    return { accessToken: at, refreshToken: rt };
  }

  //helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = await Bcrypt.genSalt(10);
    return await Bcrypt.hash(password, salt);
  }
  //helper method to hash refresh tokens
  private async saveRefreshToken(userId: number, refreshToken: string) {
    //hash refresh token
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    //save hashed refresh token
    await this.profileRepository.update(userId, {
      hashedRefreshToken: hashedRefreshToken,
    });
  }

  //method to signin a new user
  async signIn(CreateAuthDto: CreateAuthDto) {
    //check if user exists in the database
    const foundUser = await this.profileRepository.findOne({
      where: { email: CreateAuthDto.email },
      select: [
        'profileId',
        'email',
        'password',
        'role',
        'firstName',
        'lastName',
      ], //include all needed fields
    });
    if (!foundUser) {
      throw new NotFoundException(`no user with ${CreateAuthDto.email} found`);
    }

    //check if password is correct
    const foundPassword = await Bcrypt.compare(
      CreateAuthDto.password,
      foundUser.password,
    );

    if (!foundPassword) {
      throw new NotFoundException('Incorrect password');
    }

    //generate tokens if correct
    const { accessToken, refreshToken } = await this.generateTokens(
      foundUser.profileId,
      foundUser.email,
      foundUser.role,
    );

    //save refresh token in the database
    await this.saveRefreshToken(foundUser.profileId, refreshToken);

    //return tokens with user data
    return {
      accessToken,
      refreshToken,
      user: {
        profileId: foundUser.profileId,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        role: foundUser.role,
      },
    };
  }

  //sign out a user
  // This method will remove the user's session or token from the database.
  async signOut(userId: number) {
    const res = await this.profileRepository.update(userId, {
      hashedRefreshToken: null,
    });

    if (res.affected === 0) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return { message: `User with id ${userId} signed out successfully` };
  }
  //refreshToken
  // Method to refresh tokens
  async refreshTokens(id: number, refreshToken: string) {
    const foundUser = await this.profileRepository.findOne({
      where: { profileId: id },
      select: ['profileId', 'email', 'role', 'hashedRefreshToken'],
    });

    if (!foundUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (!foundUser.hashedRefreshToken) {
      throw new NotFoundException(`No refresh token found`);
    }

    // check if the provided refresh token matches the one in the database
    const refreshTokenMatches = await Bcrypt.compare(
      refreshToken,
      foundUser.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new NotFoundException('Invalid refresh token');
    }
    // generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(
        foundUser.profileId,
        foundUser.email,
        foundUser.role,
      );

    // save new refresh token in the database
    await this.saveRefreshToken(foundUser.profileId, newRefreshToken);

    // return the new tokens
    return { accessToken, refreshToken: newRefreshToken };
  }

  //method to signin an admin
  login(Admin: Admin) {
    const payload = {
      sub: Admin.adminId,
      username: Admin.username,
      role: 'admin',
      permissions: [
        'createdoctor',
        'createpatient',
        'updatedoctor',
        'updatepatient',
        'deletedoctor',
        'deletepatient',
      ],
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
