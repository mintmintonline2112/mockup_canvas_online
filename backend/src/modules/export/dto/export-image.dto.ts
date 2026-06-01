import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportImageDto {
  @ApiProperty({
    description: 'Canvas dataURL (data:image/png;base64,....) từ Fabric.js',
  })
  @IsString()
  dataUrl: string;

  @ApiProperty({
    example: 'amazon-2000',
    description: 'amazon-2000 | amazon-3000 | social-1080 | web-banner',
  })
  @IsString()
  preset: string;

  @ApiProperty({ example: 'png', enum: ['png', 'jpg'] })
  @IsOptional()
  @IsIn(['png', 'jpg'])
  format?: 'png' | 'jpg';
}
