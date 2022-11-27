import { ApiProperty } from '@nestjs/swagger';

export class errorException {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;
}
