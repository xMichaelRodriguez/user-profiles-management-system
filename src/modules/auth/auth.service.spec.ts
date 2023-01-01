import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';

import FileEntity from '../files/entities/file.entity';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
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
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MailModule,
        ConfigModule, //
      ],
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useClass: User,
        },

        MailService,
        MailService,
        ConfigService,
        EncoderService,
        JwtService,
        {
          provide: 'SequelizeInstance',
          useValue: mockedSequelize,
        },

        {
          provide: AuthGuard,
          useFactory: () => {
            return () => AuthGuard();
          },
        },
      ],

      exports: [PassportModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mailService = module.get<MailService>(MailService);
    encoderService = module.get<EncoderService>(EncoderService);
  });

  describe('AuthService Tests', () => {
    it('should create a new user', async () => {
      const createAuthDto: CreateAuthDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
      };
      jest.spyOn(encoderService, 'encodePassword').mockResolvedValue('hashed');
      jest.spyOn(mailService, 'sendVerificationUsers').mockResolvedValue(null);

      const user = await authService.create(createAuthDto);
      expect(user).toEqual({
        id: expect.any(String),
        username: 'test',
        email: 'test@test.com',
        active: false,
        isRegisteredWithGoogle: false,
      });
      expect(encoderService.encodePassword).toHaveBeenCalledWith('test');
      expect(mailService.sendVerificationUsers).toHaveBeenCalledWith(
        {
          id: expect.any(String),
          username: 'test',
          email: 'test@test.com',
          password: 'hashed',
          active: false,
          isRegisteredWithGoogle: false,
          activationToken: expect.any(String),
        },
        expect.any(String),
      );
    });

    it('should throw a ConflictException if the email is already registered', async () => {
      const createAuthDto: CreateAuthDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
      };
      jest.spyOn(encoderService, 'encodePassword').mockResolvedValue('hashed');
      jest.spyOn(mailService, 'sendVerificationUsers').mockResolvedValue(null);

      await authService.create(createAuthDto);
      try {
        await authService.create(createAuthDto);
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toEqual('This email is already registered');
      }
    });

    it('should throw an InternalServerErrorException if an unknown error occurs', async () => {
      const createAuthDto: CreateAuthDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
      };
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
});
