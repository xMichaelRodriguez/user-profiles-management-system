import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import FileEntity from './entities/file.entity';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getModelToken(FileEntity),
          useValue: FileEntity,
        },
        { provide: Sequelize, useValue: {} },

        CloudinaryService,
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
