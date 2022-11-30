import { Injectable } from '@nestjs/common';
import toStream = require('buffer-to-stream');
import { UploadApiResponse, UploadApiErrorResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  removeImage(public_id: string) {
    return new Promise((resolve, reject) => {
      v2.uploader
        .destroy(public_id)
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          reject(e.message);
        });
    });
  }
}
