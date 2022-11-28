/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { User } from '../auth/entities/auth.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService {
  private logger = new Logger(FilesService.name);
  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createFileDto: CreateFileDto,
    user: User,
    file?: Express.Multer.File,
  ) {
    if (file === undefined) throw new BadRequestException('File is require');
    try {
      const { public_id, secure_url } =
        await this.cloudinaryService.uploadImage(file);

      const fileUploaded = await this.fileEntity.create({
        public_id,
        secure_url,
        userId: user.id,
      });

      return {
        image: fileUploaded,
        createFileDto,
      };
    } catch (error) {
      this.logger.error(error.message);
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, _updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
