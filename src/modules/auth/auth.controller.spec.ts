import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize';

import { MailService } from '../mail/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EncoderService } from './encoder/encoder.service';
import User from './entities/auth.entity';
import { GoogleService } from './google/google.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockedSequelize: Sequelize;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await mockedSequelize.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
