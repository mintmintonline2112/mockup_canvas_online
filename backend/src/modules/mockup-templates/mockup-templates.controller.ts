import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { MockupTemplatesService } from './mockup-templates.service';

@ApiTags('Mockup Templates')
@Controller('mockup-templates')
export class MockupTemplatesController {
  constructor(private readonly service: MockupTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách template (background preset)' })
  list(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.service.paginate({
      page,
      limit,
      search,
      searchFields: ['name', 'type'],
      filters: { type },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTemplateDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
