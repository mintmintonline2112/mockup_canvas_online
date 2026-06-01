import { Module } from '@nestjs/common';
import { MockupTemplatesController } from './mockup-templates.controller';
import { MockupTemplatesService } from './mockup-templates.service';

@Module({
  controllers: [MockupTemplatesController],
  providers: [MockupTemplatesService],
})
export class MockupTemplatesModule {}
