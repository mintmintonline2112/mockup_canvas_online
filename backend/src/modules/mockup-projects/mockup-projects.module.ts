import { Module } from '@nestjs/common';
import { MockupProjectsController } from './mockup-projects.controller';
import { MockupProjectsService } from './mockup-projects.service';

@Module({
  controllers: [MockupProjectsController],
  providers: [MockupProjectsService],
})
export class MockupProjectsModule {}
