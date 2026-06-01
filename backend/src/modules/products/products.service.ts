import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddProductImageDto } from './dto/add-product-image.dto';

@Injectable()
export class ProductsService extends BaseService<PrismaService['product']> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.product);
  }

  findOneWithImages(id: string) {
    return this.findOne(id, { include: { images: true } });
  }

  addImage(productId: string, dto: AddProductImageDto) {
    return this.prisma.productImage.create({
      data: { ...dto, productId },
    });
  }

  listImages(productId: string) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
