/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../mail/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { EncoderService } from './encoder/encoder.service';
import User from './entities/auth.entity';
import { GoogleService } from './google/google.service';

interface IUser {
  id: string;
  username: string;
  email: string;
  isRegisteredWithGoogle: boolean;
}
describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: User,
        },
        EncoderService,
        JwtService,
        { provide: MailService, useValue: {} },
        GoogleService,
        {
          provide: AuthGuard,
          useFactory: () => {
            return () => AuthGuard();
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a token and user data on successful login', async () => {
    const loginAuthDto = { email: 'test@example.com', password: 'test' };
    const user: IUser = {
      id: '1',
      username: 'test',
      email: 'test@example.com',
      isRegisteredWithGoogle: false,
    };

    const accessToken = 'test-token';
    jest
      .spyOn(service, 'login')
      .mockImplementation(
        async () =>
          new Promise((resolve, _reject) =>
            resolve({ user: { ...user, active: true }, jwt: { accessToken } }),
          ),
      );

    const result = await controller.login(loginAuthDto);

    expect(result).toEqual({
      user: { ...user, active: true },
      jwt: { accessToken },
    });
  });

  it('should create a new user', async () => {
    const createAuthDto = new CreateAuthDto({
      username: 'test',
      email: 'test@example.com',
      password: 'test',
    });
    const user = {
      id: '1',
      username: 'test',
      email: 'test@example.com',
      active: true,
      isRegisteredWithGoogle: false,
    };
    jest
      .spyOn(service, 'create')
      .mockImplementation(
        async () =>
          new Promise((resolve, _reject) =>
            resolve(expect.objectContaining(user)),
          ),
      );

    const result = await controller.create(createAuthDto);

    expect(result).toEqual(user);
  });

  it('should request a password reset', async () => {
    const requestResetPasswordDto: RequestResetPasswordDto = {
      email: 'test@example.com',
    };
    jest
      .spyOn(service, 'requestResetPassword')
      .mockImplementation(async () => {});

    await controller.requestResetPassword(requestResetPasswordDto);

    expect(service.requestResetPassword).toHaveBeenCalledWith(
      requestResetPasswordDto,
    );
  });
});
