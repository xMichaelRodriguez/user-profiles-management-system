import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { ConfigurationService } from './config/configuration';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // middlewares
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(compression);
  app.use(helmet);
  // config documentation
  const config = new DocumentBuilder()
    .setTitle('User Profile Management System')
    .setDescription('The User Profile Management System API description')
    .setVersion('1.0')
    .addTag('Auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const configurationService = new ConfigurationService();

  const port = configurationService.getPort();

  SwaggerModule.setup('api', app, document);

  // versioning API
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  await app.listen(port, async () => {
    const url = await app.getUrl();
    console.log(`listen on  ${url}`);
  });
}
bootstrap();
