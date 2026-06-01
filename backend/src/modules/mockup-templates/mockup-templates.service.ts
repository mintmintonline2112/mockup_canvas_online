import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/base.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MockupTemplatesService extends BaseService<
  PrismaService['mockupTemplate']
> {
  constructor(prisma: PrismaService) {
    super(prisma.mockupTemplate);
  }
}
