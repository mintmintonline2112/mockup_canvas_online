import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveBackgroundDto {
  @ApiProperty({
    example: 'http://localhost:3001/uploads/products/tui-luc-binh-ab12cd.png',
    description: 'URL ảnh sản phẩm đã upload (cùng origin /uploads/...)',
  })
  @IsString()
  imageUrl: string;
}
