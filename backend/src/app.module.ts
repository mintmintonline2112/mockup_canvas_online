import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { BackgroundsModule } from './modules/backgrounds/backgrounds.module';
import { ExportModule } from './modules/export/export.module';
import { MockupProjectsModule } from './modules/mockup-projects/mockup-projects.module';
import { MockupTemplatesModule } from './modules/mockup-templates/mockup-templates.module';
import { ProductsModule } from './modules/products/products.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    ProductsModule,
    MockupTemplatesModule,
    MockupProjectsModule,
    UploadModule,
    BackgroundsModule,
    ExportModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}
