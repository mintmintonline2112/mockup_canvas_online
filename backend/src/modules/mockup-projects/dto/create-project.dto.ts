import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiPropertyOptional({ example: 'Basket – Amazon main' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: 'Fabric.js canvas.toJSON()' })
  @IsObject()
  canvasJson: Record<string, any>;
}
