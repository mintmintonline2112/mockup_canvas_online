import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BackgroundsService } from './backgrounds.service';

@ApiTags('Backgrounds')
@Controller('backgrounds')
export class BackgroundsController {
  constructor(private readonly service: BackgroundsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách background trong thư viện' })
  list(
    @Query('page') page = 1,
    @Query('limit') limit = 100,
    @Query('search') search?: string,
  ) {
    return this.service.paginate({
      page,
      limit,
      search,
      searchFields: ['name'],
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload ảnh nền vào thư viện (multipart `file`)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
  ) {
    return this.service.uploadAndCreate(file, name);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá background khỏi thư viện' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
