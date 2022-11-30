/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

    private sequelize: Sequelize,
  ) {}

  async create(
    createFileDto: CreateFileDto,
    user: User,
    file?: Express.Multer.File,
  ) {
    if (file === undefined) throw new BadRequestException('File is require');

    let fileUploaded = {};
    try {
      const { public_id, secure_url } =
        await this.cloudinaryService.uploadImage(file);

      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };

        fileUploaded = await this.fileEntity.create(
          {
            public_id,
            secure_url,
            userId: user.id,
            title: createFileDto.title,
          },
          { ...transactionHost, returning: true },
        );
      });

      return fileUploaded;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(): Promise<FileEntity[]> {
    return await this.fileEntity.findAll({
      include: ['user'],
    });
  }

  async findOne(id: string) {
    return await this.fileEntity.findOne({ where: { id }, include: ['user'] });
  }

  update(id: number, _updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
