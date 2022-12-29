import { ConfigModule, ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    return v2.config({
      cloud_name: configService.get('CLOUD_NAME'),
      api_key: configService.get('CLOUD_KEY'),
      api_secret: configService.get('CLOUD_SECRET'),
    });
  },
  inject: [ConfigService],
};
