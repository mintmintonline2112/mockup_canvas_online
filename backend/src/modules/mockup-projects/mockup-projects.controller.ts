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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MockupProjectsService } from './mockup-projects.service';

@ApiTags('Mockup Projects')
@Controller('mockup-projects')
export class MockupProjectsController {
  constructor(private readonly service: MockupProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách project (canvas đã lưu)' })
  list(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('productId') productId?: string,
  ) {
    return this.service.paginate({
      page,
      limit,
      search,
      searchFields: ['name'],
      filters: { productId },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mở 1 project để load lại canvas' })
  detail(@Param('id') id: string) {
    return this.service.findOneFull(id);
  }

  @Post()
  @ApiOperation({ summary: 'Lưu canvas.toJSON() thành project mới' })
  create(@Body() dto: CreateProjectDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
