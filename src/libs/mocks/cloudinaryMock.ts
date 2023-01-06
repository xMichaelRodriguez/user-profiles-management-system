/* eslint-disable @typescript-eslint/no-unused-vars */
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export class CloudinaryServiceMock {
  async uploadImage(
    _file: any,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return {
      secure_url: 'asdasd',
      public_id: 'holamundo',
    } as UploadApiResponse;
  }
}
