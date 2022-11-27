import { Test, TestingModule } from '@nestjs/testing';

import { EncoderService } from './encoder.service';

describe('EncoderService', () => {
  let service: EncoderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncoderService],
    }).compile();

    service = module.get<EncoderService>(EncoderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
