import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 16)
  title: string;
}
