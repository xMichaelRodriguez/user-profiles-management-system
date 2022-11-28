import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { FilesModule } from './modules/files/files.module';

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
            },
    }),
    AuthModule,
    FilesModule,
    CloudinaryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
