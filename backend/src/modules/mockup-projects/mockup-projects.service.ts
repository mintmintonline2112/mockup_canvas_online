import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/base.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MockupProjectsService extends BaseService<
  PrismaService['mockupProject']
> {
  constructor(prisma: PrismaService) {
    super(prisma.mockupProject);
  }

  findOneFull(id: string) {
    return this.findOne(id, { include: { product: true, template: true } });
  }
}
