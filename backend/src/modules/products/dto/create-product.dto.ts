import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'WH-BASKET-001' })
  @IsString()
  @MaxLength(120)
  sku: string;

  @ApiProperty({ example: 'Water hyacinth round basket' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'basket' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;
}
