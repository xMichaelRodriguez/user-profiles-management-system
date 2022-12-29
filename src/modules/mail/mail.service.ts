import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import User from '../auth/entities/auth.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerificationUsers(user: User, token: string) {
    const url = `http://localhost:3000/v1/auth/activate-accounts/?id=${user.id}&code=${token}`;

    const sendMailOptions = {
      to: user.email,
      subject: 'Welcome to U-P-S-M; Confirm Your Account!',
      template: './transactional',
      context: {
        name: user.username,
        url,
      },
    };
    await this.mailerService.sendMail(sendMailOptions);
  }
}
