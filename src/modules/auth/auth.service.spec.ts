import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { mockedConfigService } from 'src/libs/mocks/config.service';
import { mockedJwtService } from 'src/libs/mocks/jwt.service';
import { mockMailService } from 'src/libs/mocks/mail.service';
import { createAuthDto } from 'src/libs/mocks/user.mock';

import FileEntity from '../files/entities/file.entity';
import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';
import { EncoderService } from './encoder/encoder.service';
import User from './entities/auth.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let mailService: MailService;
  let encoderService: EncoderService;
  let mockedSequelize: Sequelize;

  beforeAll(async () => {
    // Crea una instancia mock de Sequelize y establece la conexión con la base de datos
    mockedSequelize = new Sequelize({
      database: 'test',
      username: 'root',
      password: '123456',
      dialect: 'sqlite',
      models: [User, FileEntity],
    });
    await mockedSequelize.authenticate();

    await mockedSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: User,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        { provide: JwtService, useValue: mockedJwtService },

        {
          provide: 'SequelizeInstance',
          useValue: mockedSequelize,
        },
        { provide: MailService, useValue: mockMailService },
        EncoderService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mailService = module.get<MailService>(MailService);
    encoderService = module.get<EncoderService>(EncoderService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a new user', async () => {
    jest.spyOn(encoderService, 'encodePassword').mockResolvedValue('hashed');
    jest.spyOn(mailService, 'sendVerificationUsers').mockResolvedValue(null);

    const user = await authService.create(createAuthDto);
    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        username: 'test',
        email: 'test@test.com',
        active: false,
        password: 'hashed',
        isRegisteredWithGoogle: false,
        activationToken: expect.any(String),
      }),
    );

    expect(encoderService.encodePassword).toHaveBeenCalledWith('test');
    expect(mailService.sendVerificationUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'test',
        email: 'test@test.com',
        password: 'hashed',
        active: false,
        isRegisteredWithGoogle: false,
      }),
      expect.any(String),
    );
  });

  it('should throw a ConflictException if the email is already registered', async () => {
    jest.spyOn(encoderService, 'encodePassword').mockResolvedValue('hashed');
    jest.spyOn(mailService, 'sendVerificationUsers').mockResolvedValue(null);

    try {
      await authService.create(createAuthDto);
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.message).toEqual('This email is already registered');
    }
  });

  it('should throw an InternalServerErrorException if an unknown error occurs', async () => {
    jest.spyOn(encoderService, 'encodePassword').mockImplementation(() => {
      throw new Error();
    });

    try {
      await authService.create(createAuthDto);
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
    }
  });
});
