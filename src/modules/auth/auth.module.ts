import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
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
