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
import { AddProductImageDto } from './dto/add-product-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm (phân trang + search)' })
  list(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.productsService.paginate({
      page,
      limit,
      search,
      searchFields: ['sku', 'name'],
      filters: { category },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết sản phẩm kèm ảnh' })
  detail(@Param('id') id: string) {
    return this.productsService.findOneWithImages(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Get(':id/images')
  images(@Param('id') id: string) {
    return this.productsService.listImages(id);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Gắn ảnh đã upload vào sản phẩm' })
  addImage(@Param('id') id: string, @Body() dto: AddProductImageDto) {
    return this.productsService.addImage(id, dto);
  }
}
