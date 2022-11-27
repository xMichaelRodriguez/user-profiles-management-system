import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EncoderService } from './encoder/encoder.service';
import { User } from './entities/auth.entity';
import { GoogleStrategy } from './google-strategy';
import { GoogleService } from './google/google.service';
import { JwtStrategy } from './jwtStrategy';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
    SequelizeModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EncoderService,
    JwtStrategy,
    GoogleStrategy,
    GoogleService,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
