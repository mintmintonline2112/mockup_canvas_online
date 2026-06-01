import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'White Studio' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'white-studio',
    description: 'white-studio | minimal-interior | pastel-sunlight | custom',
  })
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiProperty({ description: 'Fabric.js canvas.toJSON()' })
  @IsObject()
  canvasJson: Record<string, any>;
}
