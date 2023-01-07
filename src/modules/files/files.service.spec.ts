import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Sequelize } from 'sequelize-typescript';
import { file, fileMock, filesMock, user } from 'src/libs/mocks/file.service';
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

  it('should create a new File', async () => {
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
        Promise.resolve({
          public_id: 'abc123',
          secure_url: 'https://example.com',
        } as UploadApiResponse | UploadApiErrorResponse),
      );

    const transactionSpy = jest.spyOn(mockedSequelize, 'transaction');

    const result = await service.create(createFileDto, user, file);

    expect(uploadImageSpy).toHaveBeenCalledWith(file);
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: expect.any(String),
      public_id: 'abc123',
      secure_url: 'https://example.com',
      userId: '1',
      title: createFileDto.title,
    });
  });

  it('should return all files for the given user', async () => {
    const findAllSpy = jest
      .spyOn(FileEntity, 'findAll')
      .mockResolvedValue(filesMock);

    const result = await service.findAll(user);
    expect(findAllSpy).toHaveBeenCalledWith({
      where: {
        userId: user.id,
      },
      include: ['user'],
    });

    expect(result).toEqual(filesMock);
  });

  describe('FindOne Method', () => {
    it('should return one file for the given user', async () => {
      const fileId = '1';
      const findOneSpy = jest
        .spyOn(FileEntity, 'findOne')
        .mockResolvedValue(fileMock);

      const result = await service.findOne(fileId, user);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: fileId, userId: user.id },
        include: ['user'],
      });

      expect(result).toEqual(fileMock);
    });
    it('should throw an error if the file is not found', async () => {
      const fileId = '1';
      jest.spyOn(FileEntity, 'findOne').mockResolvedValue(null);

      try {
        await service.findOne(fileId, user);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('File not found');
      }
    });
  });

  describe('Update Method', () => {
    it('should update an existing file', async () => {
      const fileId = '1';
      const updateFileDto = {
        title: 'Updated file',
      };

      const findOneSpy = jest
        .spyOn(FileEntity, 'findOne')
        .mockResolvedValue(fileMock);
      const uploadImageSpy = jest
        .spyOn(cloudinaryService, 'uploadImage')
        .mockResolvedValue({
          secure_url: 'https://example.com/new-file.jpg',
          public_id: 'def456',
        } as UploadApiResponse | UploadApiErrorResponse);

      const removeImageSpy = jest
        .spyOn(cloudinaryService, 'removeImage')
        .mockResolvedValue({ result: 'ok' });

      const updateSpy = jest.spyOn(FileEntity, 'update').mockResolvedValue([1]);

      const transactionSpy = jest.spyOn(mockedSequelize, 'transaction');

      const result = await service.update(fileId, updateFileDto, file, user);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: fileId, userId: user.id },
      });

      expect(uploadImageSpy).toHaveBeenCalledWith(file);
      expect(removeImageSpy).toHaveBeenCalledWith(fileMock.public_id);

      expect(updateSpy).toHaveBeenCalledWith(
        {
          public_id: 'def456',
          secure_url: 'https://example.com/new-file.jpg',
          userId: user.id,
          title: updateFileDto.title,
        },
        { where: { id: fileId, userId: user.id }, transaction: {} },
      );
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(undefined);
    });

    it('should throw a NotFoundException if the file is not found', async () => {
      const fileId = '2';
      const updateFileDto = {
        title: 'Updated file',
      };
      const file = {
        path: '/path/to/file.jpg',
      } as Express.Multer.File;

      jest.spyOn(FileEntity, 'findOne').mockResolvedValue(null);

      try {
        await service.update(fileId, updateFileDto, file, user);
        fail('Expected a NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(`File with id:${fileId} not found`);
      }
    });
  });

  describe('Remove Method', () => {
    // it('should delete the file and return the number of rows affected', async () => {
    //   const fileId = '1';
    //   const findOneSpy = jest
    //     .spyOn(FileEntity, 'findOne')
    //     .mockResolvedValue(fileMock);
    //   const deleteSpy = jest.spyOn(FileEntity, 'destroy').mockResolvedValue(1);

    //   await service.remove(fileId, user);
    //   expect(findOneSpy).toHaveBeenCalledWith({
    //     where: { id: fileId, userId: user.id },
    //   });
    //   expect(deleteSpy).toHaveBeenCalledWith({
    //     where: { id: fileId, userId: user.id },
    //   });
    // });

    it('should throw a NotFoundException if the file is not found', async () => {
      const fileId = '2';
      jest.spyOn(FileEntity, 'findOne').mockResolvedValue(null);

      try {
        await service.remove(fileId, user);
        fail('Expected a NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('File Not Found');
      }
    });
  });
});
