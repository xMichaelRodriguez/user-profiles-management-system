import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './modules/auth/auth.module';
import User from './modules/auth/entities/auth.entity';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import FileEntity from './modules/files/entities/file.entity';
import { FilesModule } from './modules/files/files.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        process.env.DATABASE_URL !== undefined
          ? {
              dialect: 'postgres',
              uri: process.env.DATABASE_URL,
              autoLoadModels: true,
              synchronize: true,
            }
          : {
              dialect: 'postgres',
              host: configService.get('PG_HOST'),
              port: +configService.get<number>('PG_PORT'),
              username: configService.get('PG_USER'),
              password: configService.get('PG_PASSWORD'),
              database: configService.get('PG_DATABASE'),
              autoLoadModels: true,
              synchronize: true,
              repositoryMode: true,
              models: [User, FileEntity],
              modelMatch: (filename, member) =>
                filename.toLocaleLowerCase() === member.toLocaleLowerCase(),
            },
    }),
    AuthModule,
    FilesModule,
    CloudinaryModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
