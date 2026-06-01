import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class AddProductImageDto {
  @ApiProperty({ example: 'http://localhost:3001/uploads/products/basket-3f9a2b.png' })
  @IsString()
  originalUrl: string;

  @ApiProperty({ example: 'basket-3f9a2b.png' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 2400 })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ example: 2400 })
  @IsInt()
  @Min(1)
  height: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  transparentUrl?: string;
}
