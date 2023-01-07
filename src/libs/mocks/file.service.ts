/* eslint-disable @typescript-eslint/no-unused-vars */
import { Readable } from 'nodemailer/lib/xoauth2';
import User from 'src/modules/auth/entities/auth.entity';
import { CreateFileDto } from 'src/modules/files/dto/create-file.dto';
import FileEntity from 'src/modules/files/entities/file.entity';

export const file: Express.Multer.File = {
  fieldname: 'test',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('some binary data'),
  size: 123,
  stream: new Readable(),
  destination: '',
  filename: '',
  path: '',
};

export const user = {
  id: '1',
  email: 'test@test.com',
  username: 'test',
  password: 'test',
} as User;

export class FilesServiceMock {
  async create(
    _createFileDto: CreateFileDto,
    _user: User,
    _file: any,
  ): Promise<FileEntity> {
    return {
      public_id: 'abc123',
      secure_url: 'https://example.com',
      userId: 123,
      title: 'My file',
    } as unknown as FileEntity;
  }
}

export const filesMock = [
  {
    id: '1',
    public_id: 'abc123',
    secure_url: 'https://example.com',
    userId: '1',
    title: 'File 1',
  },
  {
    id: '2',
    public_id: 'def456',
    secure_url: 'https://example.com',
    userId: '1',
    title: 'File 2',
  },
] as FileEntity[];

export const fileMock = {
  id: '1',
  public_id: 'abc123',
  secure_url: 'https://example.com',
  userId: '1',
  title: 'File 1',
} as FileEntity;
