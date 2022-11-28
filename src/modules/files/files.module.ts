import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { JwtStrategy } from '../auth/jwtStrategy';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { FileEntity } from './entities/file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [SequelizeModule.forFeature([FileEntity]), CloudinaryModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
