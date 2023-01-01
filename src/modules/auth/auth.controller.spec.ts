import { JwtService } from '@nestjs/jwt';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../mail/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EncoderService } from './encoder/encoder.service';
import User from './entities/auth.entity';
import { GoogleService } from './google/google.service';

describe('AuthController', () => {
  let controller: AuthController;

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
