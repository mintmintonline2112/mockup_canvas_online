import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExportImageDto } from './dto/export-image.dto';
import { ExportService } from './export.service';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('presets')
  @ApiOperation({ summary: 'Danh sách channel export preset' })
  presets() {
    return this.exportService.listPresets();
  }

  @Post()
  @ApiOperation({ summary: 'Export ảnh mockup theo preset (Sharp resize)' })
  export(@Body() dto: ExportImageDto) {
    return this.exportService.exportImage(dto);
  }
}
