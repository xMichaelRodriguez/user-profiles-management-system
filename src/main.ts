import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigurationService } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('User Profile Management System')
    .setDescription('The User Profile Management System API description')
    .setVersion('1.0')
    .addTag('Auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const configurationService = new ConfigurationService();

  const port = configurationService.getPort();

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  SwaggerModule.setup('api', app, document);
  await app.listen(port, async () => {
    const url = await app.getUrl();
    console.log(`listen on  ${url}`);
  });
}
bootstrap();
