import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import FileEntity from './entities/file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;
  const user = {
    id: '1',
    username: 'test',
    email: 'test@test.com',
    password: 'test',
  };
  const mockId = '1';
  const file = {} as Express.Multer.File;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        FilesService,
        { provide: getModelToken(FileEntity), useValue: FileEntity },
        CloudinaryService,
        { provide: Sequelize, useValue: {} },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a file', async () => {
    const createFileDto: CreateFileDto = {
      title: 'test',
    };

    jest.spyOn(service, 'create').mockImplementation(() => Promise.resolve({}));

    // Act
    await controller.create(expect.objectContaining(user), createFileDto, file);

    // Assert
    expect(service.create).toHaveBeenCalledWith(createFileDto, user, file);
  });

  it('it should return an array of FileEntity', async () => {
    jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve([] as FileEntity[]));

    await controller.findAll(expect.objectContaining(user));

    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('it should return a file', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockImplementation(() => Promise.resolve({} as FileEntity));

    await controller.findOne(expect.objectContaining(user), mockId);

    expect(service.findOne).toHaveBeenCalledWith(mockId, user);
  });

  it('should update a file', async () => {
    const updateFileDto = { title: 'new title' };
    jest
      .spyOn(service, 'update')
      .mockImplementation(async () => Promise.resolve());

    await controller.update(
      expect.objectContaining(user),
      mockId,
      updateFileDto,
      file,
    );

    expect(service.update).toHaveBeenCalledWith(
      mockId,
      updateFileDto,
      file,
      user,
    );
  });

  it('should remove a file', async () => {
    jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

    await controller.remove(expect.objectContaining(user), mockId);

    expect(service.remove).toBeCalledWith(mockId, user);
  });
});
