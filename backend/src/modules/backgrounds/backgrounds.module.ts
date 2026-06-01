import { Module } from '@nestjs/common';
import { UploadModule } from '../upload/upload.module';
import { BackgroundsController } from './backgrounds.controller';
import { BackgroundsService } from './backgrounds.service';

@Module({
  imports: [UploadModule],
  controllers: [BackgroundsController],
  providers: [BackgroundsService],
})
export class BackgroundsModule {}
