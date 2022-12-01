import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncoderService {
  private salt: Promise<string> = bcrypt.genSalt();

  async encodePassword(password: string): Promise<string> {
    return await bcrypt.hash(password, await this.salt);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
