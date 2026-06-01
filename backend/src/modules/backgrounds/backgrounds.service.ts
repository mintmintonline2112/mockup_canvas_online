import { Injectable } from '@nestjs/common';
import { rm } from 'fs/promises';
import { join, parse } from 'path';
import { BaseService } from 'src/common/base/base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class BackgroundsService extends BaseService<
  PrismaService['background']
> {
  constructor(
    prisma: PrismaService,
    private readonly upload: UploadService,
  ) {
    super(prisma.background);
  }

  /** Upload ảnh + sinh thumbnail rồi lưu 1 record vào thư viện. */
  async uploadAndCreate(file: Express.Multer.File, name?: string) {
    const img = await this.upload.uploadBackgroundImage(file);
    return this.create({
      name: name?.trim() || img.fileName,
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl,
      fileName: img.fileName,
      width: img.width,
      height: img.height,
    });
  }

  /** Xoá record + file ảnh gốc và thumbnail tương ứng trên đĩa. */
  async delete(id: string) {
    const bg = (await this.findOne(id)) as { fileName: string };
    const dir = join(process.cwd(), 'uploads', 'backgrounds');
    const base = parse(bg.fileName).name;
    await Promise.allSettled([
      rm(join(dir, bg.fileName), { force: true }),
      rm(join(dir, 'thumbs', `${base}-thumb.webp`), { force: true }),
    ]);
    return super.delete(id);
  }
}
