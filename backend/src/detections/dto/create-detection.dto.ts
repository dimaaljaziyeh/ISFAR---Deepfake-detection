import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateDetectionDto {
  @ApiProperty({ example: 'image.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  @IsEnum(MediaType)
  mediaType: MediaType;
}
