import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { file, user } from 'src/libs/mocks/file.service';
import { SequelizeMock } from 'src/libs/mocks/mock.sequelize';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import FileEntity from './entities/file.entity';
import { FilesService } from './files.service';

describe('FilesService', () => {
  const createFileDto: CreateFileDto = {
    title: 'test',
  };
  let service: FilesService;
  let cloudinaryService: CloudinaryService;
  let mockedSequelize: Sequelize;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getModelToken(FileEntity),
          useValue: FileEntity,
        },
        { provide: CloudinaryService, useValue: new CloudinaryService() },
        {
          provide: Sequelize,
          useValue: new SequelizeMock(),
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    mockedSequelize = module.get<Sequelize>(Sequelize);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const createSpy = jest.spyOn(FileEntity, 'create').mockResolvedValue({
      id: expect.any(String),
      public_id: 'abc123',
      secure_url: 'https://example.com',
      userId: '1',
      title: createFileDto.title,
    });
    const uploadImageSpy = jest
      .spyOn(cloudinaryService, 'uploadImage')
      .mockImplementation(async () =>
        Promise.resolve({ secure_url: 'asdasd', public_id: 'holamundo' } as
          | UploadApiResponse
          | UploadApiErrorResponse),
      );

    const transactionSpy = jest
      .spyOn(mockedSequelize, 'transaction')
      .mockResolvedValue({ transaction: {} } as unknown as Transaction);

    const result = await service.create(createFileDto, user, file);

    console.log({
      result,
      uploadImageSpy: uploadImageSpy.mock.calls.length,
      createSpy: createSpy.mock.calls.length,
    });
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(uploadImageSpy).toHaveBeenCalledWith(file);
    expect(createSpy.mock.calls.length).toEqual(1);
    expect(result).toEqual({
      id: expect.any(String),
      public_id: 'abc123',
      secure_url: 'https://example.com',
      userId: '1',
      title: createFileDto.title,
    });
  });
});
