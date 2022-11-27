import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';

import { AuthService } from '../auth.service';
import { CreateGoogleDto } from '../dto/create-google.dto';
import { User } from '../entities/auth.entity';
import { JwtPayload } from '../interfaces/jwt.interface';

interface IFormatUser {
  id: string;
  email: string;
  username: string;
  active: boolean;
  isRegisteredWithGoogle: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GoogleService {
  constructor(
    @InjectModel(User)
    private authModel: typeof User,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async prepareUserRegister(req) {
    if (!req.user) return 'Not user from google';

    const user = {
      username: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
    };
    const userExists = await this.authModel.findOne({
      where: { email: user.email },
    });

    if (!userExists) {
      return this.registerUserWithGoogle(user);
    }

    return this.loginWithGoogle(userExists.toJSON());
  }

  async loginWithGoogle(loginAuthDto: User) {
    if (!loginAuthDto.isRegisteredWithGoogle)
      throw new ConflictException('This email is already registered');

    const { id, email, active } = loginAuthDto;
    const payload: JwtPayload = {
      id,
      email,
      active,
    };
    const accessToken = await this.jwtService.sign(payload);
    const formatUser: IFormatUser = this.formatUserDataToResponse(loginAuthDto);
    return {
      user: formatUser,
      jwt: accessToken,
    };
  }

  async registerUserWithGoogle(user: CreateGoogleDto) {
    try {
      const values = {
        ...user,
        isRegisteredWithGoogle: true,
        active: true,
      };
      const options = { returning: true };

      const { id, email, active } = await this.authModel.create(
        values,
        options,
      );
      const payload: JwtPayload = {
        id,
        email,
        active,
      };

      const accessToken = await this.jwtService.sign(payload);

      return { user, jwt: accessToken };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('This email is already registered');
      }
      console.log({ ERROR: error.message });
      throw new InternalServerErrorException();
    }
  }

  formatUserDataToResponse(user: User): IFormatUser {
    const {
      id,
      email,
      username,
      active,
      isRegisteredWithGoogle,
      createdAt,
      updatedAt,
    } = user;

    return {
      id,
      email,
      username,
      active,
      isRegisteredWithGoogle,
      createdAt,
      updatedAt,
    };
  }
}
