import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  ParseFilePipeBuilder,
  UploadedFile,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { GetUser } from '../auth/decorators/get-user.decorator';
import User from '../auth/entities/auth.entity';
import { CreateFileDto } from './dto/create-file.dto';
import FileEntity from './entities/file.entity';
import { FilesService } from './files.service';

@ApiTags('Upload')
@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('/')
  create(
    @GetUser() user: User,
    @Body() createFileDto: CreateFileDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(gif|jpeg|png|jpg)/gi,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file?: Express.Multer.File,
  ) {
    return this.filesService.create(createFileDto, user, file);
  }

  @Get()
  findAll(@GetUser() user: User): Promise<FileEntity[]> {
    return this.filesService.findAll(user);
  }

  @Get(':id')
  findOne(@GetUser() user: User, @Param('id') id: string) {
    return this.filesService.findOne(id, user);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateFileDto: { title?: string },
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(gif|jpeg|png|jpg)/gi,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    return this.filesService.update(id, updateFileDto, file, user);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.filesService.remove(id, user);
  }
}
