import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ParseFilePipeBuilder,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { GetUser } from '../auth/decorators/get-user.decorator';
import User from '../auth/entities/auth.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import FileEntity from './entities/file.entity';
import { FilesService } from './files.service';

@ApiTags('Upload')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('/')
  @UseGuards(AuthGuard('jwt'))
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
  findAll(): Promise<FileEntity[]> {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
