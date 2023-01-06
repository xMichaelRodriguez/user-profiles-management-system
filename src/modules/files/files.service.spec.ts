import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import sequelize from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { file, user } from 'src/libs/mocks/file.service';

import User from '../auth/entities/auth.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import FileEntity from './entities/file.entity';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;
  let cloudinaryService: CloudinaryService;
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getModelToken(FileEntity),
          useValue: FileEntity,
        },
        { provide: CloudinaryService, useClass: CloudinaryService },
        {
          provide: getModelToken(Sequelize),
          useValue: mockedSequelize,
        },
        Sequelize,
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const createFileDto: CreateFileDto = {
      title: 'test',
    };

    const uploadImageSpy = jest
      .spyOn(cloudinaryService, 'uploadImage')
      .mockImplementation(async () =>
        Promise.resolve({ secure_url: 'asdasd', public_id: 'holamundo' } as
          | UploadApiResponse
          | UploadApiErrorResponse),
      );

    const createSpy = jest.spyOn(FileEntity, 'create').mockResolvedValue({
      public_id: 'abc123',
      secure_url: 'https://example.com',
      userId: 123,
      title: 'My file',
    });

    const transactionSpy = jest.mock('sequelize', () => ({
      transaction: jest.fn(() => Promise.resolve()),
    }));

    const result = await service.create(createFileDto, user, file);

    expect(uploadImageSpy).toHaveBeenCalledWith(file);

    expect(createSpy).toHaveBeenCalledWith(
      {
        public_id: 'abc123',
        secure_url: 'https://example.com',
        userId: 123,
        title: 'My file',
      },
      { transaction: {}, returning: true },
    );
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      public_id: 'abc123',
      secure_url: 'https://example.com',
      userId: 123,
      title: 'My file',
    });
  });
});
