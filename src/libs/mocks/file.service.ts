import { Readable } from 'nodemailer/lib/xoauth2';
import User from 'src/modules/auth/entities/auth.entity';

export const file: Express.Multer.File = {
  fieldname: 'file',
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
