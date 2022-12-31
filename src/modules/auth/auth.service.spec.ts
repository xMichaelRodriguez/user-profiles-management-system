import { MailerService } from '@nestjs-modules/mailer';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { DataTypes, Sequelize } from 'sequelize';

import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { EncoderService } from './encoder/encoder.service';
import User from './entities/auth.entity';
describe('AuthService', () => {
  let authService: AuthService;
  let mailerService: MailerService;
  let encoderService: EncoderService;
  let mockedSequelize: Sequelize;

  beforeAll(async () => {
    // Crea una instancia mock de Sequelize y establece la conexión con la base de datos
    mockedSequelize = new Sequelize({
      database: 'test',
      username: 'root',
      password: '123456',
      dialect: 'sqlite',
    });
    await mockedSequelize.authenticate();

    // Inicializa el modelo de datos y sincroniza con la base de datos
    mockedSequelize.model('User').init(User.getAttributes(), {
      timestamps: false,
      sequelize: new Sequelize(),
    });
    await mockedSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        MailerService,
        EncoderService,
        {
          provide: 'SequelizeInstance',
          useValue: mockedSequelize,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mailerService = module.get<MailerService>(MailerService);
    encoderService = module.get<EncoderService>(EncoderService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createAuthDto: CreateAuthDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
      };
      jest.spyOn(encoderService, 'encodePassword').mockResolvedValue('hashed');
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue(null);

      const user = await authService.create(createAuthDto);
      expect(user).toEqual({
        id: expect.any(String),
        username: 'test',
        email: 'test@test.com',
        active: false,
        isRegisteredWithGoogle: false,
      });
      expect(encoderService.encodePassword).toHaveBeenCalledWith('test');
      expect(mailerService.sendMail).toHaveBeenCalledWith(
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
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue(null);

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
