import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import nodemailer from 'nodemailer';

import User from '../auth/entities/auth.entity';
import { MailService } from './mail.service';

jest.mock('nodemailer');
const options = {
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your@email.com',
    pass: 'your-password',
  },
};
describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MailerModule],
      providers: [
        { provide: MailerService, useClass: MailerService },
        { provide: 'MAILER_OPTIONS', useValue: options },
        MailService,
      ],
      exports: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should been called with 1', async () => {
    // Create a mock function to replace the real sendMail function
    const sendMailMock = jest.fn().mockResolvedValue(undefined);

    const options = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your@email.com',
        pass: 'your-password',
      },
    };
    nodemailer.createTransport = jest
      .fn()
      .mockReturnValue({ sendMail: sendMailMock, options });

    const user = {
      id: '123',
      username: 'John',
      email: 'john@example.com',
    } as User;
    const token = 'abcdef';

    await service.sendVerificationUsers(user, token);

    expect(sendMailMock).toHaveBeenCalledWith({
      to: 'john@example.com',
      subject: 'Welcome to U-P-S-M; Confirm Your Account!',
      html: expect.stringMatching(/Welcome to U-P-S-M, John/),
      text: expect.stringMatching(/Welcome to U-P-S-M, John/),
    });
  });
});
