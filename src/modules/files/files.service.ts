/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import User from '../auth/entities/auth.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import FileEntity from './entities/file.entity';

@Injectable()
export class FilesService {
  private logger = new Logger(FilesService.name);

  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,

    private readonly cloudinaryService: CloudinaryService,

    private readonly sequelize: Sequelize,
  ) {}

  async create(
    createFileDto: CreateFileDto,
    user: User,
    file?: Express.Multer.File,
  ) {
    if (file === undefined) throw new BadRequestException('File is require');

    let fileUploaded: FileEntity = {} as FileEntity;
    try {
      const { public_id, secure_url } =
        await this.cloudinaryService.uploadImage(file);

      await this.sequelize.transaction(async (t) => {
        fileUploaded = await this.fileEntity.create(
          {
            public_id,
            secure_url,
            userId: user.id,
            title: createFileDto.title,
          },
          { transaction: t, returning: true },
        );
      });
      if (!fileUploaded || typeof fileUploaded !== 'object') {
        throw new InternalServerErrorException();
      }
      return fileUploaded;
    } catch (error) {
      console.log({ error });
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(user: User): Promise<FileEntity[]> {
    return await this.fileEntity.findAll({
      where: {
        userId: user.id,
      },
      include: ['user'],
    });
  }

  async findOne(id: string, user: User) {
    const result = await this.fileEntity.findOne({
      where: { id, userId: user.id },
      include: ['user'],
    });

    if (!result) throw new NotFoundException('File not found');

    return result;
  }

  async update(
    id: string,
    updateFileDto: UpdateFileDto,
    file: Express.Multer.File,
    user: User,
  ) {
    const optionsQuery = {
      id,
      userId: user.id,
    };
    const fileFound = await this.fileEntity.findOne({
      where: optionsQuery,
    });

    if (!fileFound) throw new NotFoundException(`File with id:${id} not found`);

    try {
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };
        let data = {};
        if (file !== undefined) {
          const [{ public_id, secure_url }, imageRemoved] = await Promise.all([
            await this.cloudinaryService.uploadImage(file),
            await this.cloudinaryService.removeImage(fileFound.public_id),
          ]);

          data = {
            public_id,
            secure_url,
          };
        }
        await this.fileEntity.update(
          {
            ...data,
            userId: user.id,
            title: updateFileDto.title,
          },
          {
            where: optionsQuery,
            transaction: transactionHost.transaction,
          },
        );
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string, user: User) {
    const optionsQuery = {
      id,
      userId: user.id,
    };
    const fileFound = await this.fileEntity.findOne({
      where: optionsQuery,
    });

    if (!fileFound) throw new NotFoundException('File Not Found');

    try {
      await this.cloudinaryService.removeImage(fileFound.public_id);
      this.fileEntity.destroy({
        where: optionsQuery,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
