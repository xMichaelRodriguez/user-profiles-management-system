import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth.service';
import { EncoderService } from '../encoder/encoder.service';
import { User } from '../entities/auth.entity';
import { GoogleService } from './google.service';

describe('GoogleServiceService', () => {
  let service: GoogleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleService,
        {
          provide: getModelToken(User),
          useValue: User,
        },
        AuthService,
        JwtService,
        EncoderService,
      ],
    }).compile();

    service = module.get<GoogleService>(GoogleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
