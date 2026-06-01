import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RemoveBackgroundDto } from './dto/remove-background.dto';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('product-image')
  @ApiOperation({ summary: 'Upload ảnh sản phẩm gốc (PNG/JPG/WEBP)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadProductImage(file);
  }

  @Post('remove-background')
  @ApiOperation({ summary: 'Tách nền ảnh sản phẩm -> PNG trong suốt (local AI)' })
  async removeBackground(@Body() dto: RemoveBackgroundDto) {
    return this.uploadService.removeBackground(dto.imageUrl);
  }
}
