import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join, parse } from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import { ServerConfig } from 'src/config/server.config';

const execFileAsync = promisify(execFile);

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadedImage {
  originalUrl: string;
  fileName: string;
  width: number;
  height: number;
}

export interface UploadedBackground {
  imageUrl: string;
  thumbnailUrl: string;
  fileName: string;
  width: number;
  height: number;
}

export interface RemovedBackground {
  transparentUrl: string;
  fileName: string;
  width: number;
  height: number;
}

@Injectable()
export class UploadService {
  private readonly rootPath = 'uploads';

  constructor(private readonly config: ConfigService) {}

  private slugify(name: string): string {
    return (
      parse(name || '')
        .name.normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'image'
    );
  }

  private publicUrl(relativePath: string): string {
    const server = this.config.get<ServerConfig>('server');
    const base = server?.publicBaseUrl ?? '';
    return `${base}/${relativePath}`.replace(/([^:]\/)\/+/g, '$1');
  }

  /** Map URL công khai (…/uploads/…) về đường dẫn file local; null nếu không phải. */
  private resolveLocalPath(imageUrl: string): string | null {
    try {
      const pathname = new URL(imageUrl).pathname; // /uploads/products/x.png
      const idx = pathname.indexOf(`/${this.rootPath}/`);
      if (idx === -1) return null;
      const relative = pathname.slice(idx + 1); // uploads/products/x.png
      const abs = join(process.cwd(), decodeURIComponent(relative));
      return existsSync(abs) ? abs : null;
    } catch {
      return null;
    }
  }

  /**
   * Upload 1 ảnh sản phẩm — KHÔNG đụng vào pixel/texture (giữ layer gốc).
   * Sharp chỉ dùng để đọc metadata (width/height) phục vụ cảnh báo chất lượng.
   */
  async uploadProductImage(file: Express.Multer.File): Promise<UploadedImage> {
    if (!file) throw new BadRequestException('File is required');
    if (!ALLOWED.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG and WEBP images are allowed');
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 25MB');
    }

    const meta = await sharp(file.buffer).metadata();
    const ext = (parse(file.originalname).ext || '.png').replace('.', '');
    const suffix = Math.random().toString(36).slice(2, 8);
    const fileName = `${this.slugify(file.originalname)}-${suffix}.${ext}`;

    const subFolder = 'products';
    const targetDir = join(process.cwd(), this.rootPath, subFolder);
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

    await writeFile(join(targetDir, fileName), file.buffer);

    const relative = `${this.rootPath}/${subFolder}/${fileName}`;
    return {
      originalUrl: this.publicUrl(relative),
      fileName,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }

  /**
   * Upload 1 ảnh background vào thư viện. Lưu ảnh gốc + sinh thumbnail (Sharp)
   * để lưới thư viện load nhẹ. KHÔNG đụng pixel ảnh gốc.
   */
  async uploadBackgroundImage(
    file: Express.Multer.File,
  ): Promise<UploadedBackground> {
    if (!file) throw new BadRequestException('File is required');
    if (!ALLOWED.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG and WEBP images are allowed');
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 25MB');
    }

    const meta = await sharp(file.buffer).metadata();
    const ext = (parse(file.originalname).ext || '.png').replace('.', '');
    const suffix = Math.random().toString(36).slice(2, 8);
    const baseName = `${this.slugify(file.originalname)}-${suffix}`;
    const fileName = `${baseName}.${ext}`;
    const thumbName = `${baseName}-thumb.webp`;

    const subFolder = 'backgrounds';
    const targetDir = join(process.cwd(), this.rootPath, subFolder);
    const thumbDir = join(targetDir, 'thumbs');
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });
    if (!existsSync(thumbDir)) mkdirSync(thumbDir, { recursive: true });

    await writeFile(join(targetDir, fileName), file.buffer);
    await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(join(thumbDir, thumbName));

    return {
      imageUrl: this.publicUrl(`${this.rootPath}/${subFolder}/${fileName}`),
      thumbnailUrl: this.publicUrl(
        `${this.rootPath}/${subFolder}/thumbs/${thumbName}`,
      ),
      fileName,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }

  /**
   * Tách nền ảnh sản phẩm (AI segmentation, chạy local — @imgly).
   * KHÔNG tái tạo pixel sản phẩm, chỉ xoá nền -> PNG alpha trong suốt.
   */
  async removeBackground(imageUrl: string): Promise<RemovedBackground> {
    if (!imageUrl) throw new BadRequestException('imageUrl is required');

    const localPath = this.resolveLocalPath(imageUrl);
    if (!localPath) {
      throw new BadRequestException(
        'Ảnh phải là ảnh đã upload trên server (…/uploads/…)',
      );
    }

    const base = parse(localPath).name;
    const fileName = `${base}-nobg.png`;
    const subFolder = 'products';
    const targetDir = join(process.cwd(), this.rootPath, subFolder);
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });
    const outPath = join(targetDir, fileName);

    // Chạy imgly trong process con (tránh xung đột libvips với sharp của app).
    const worker = join(process.cwd(), 'scripts', 'remove-bg-worker.cjs');
    try {
      await execFileAsync(process.execPath, [worker, localPath, outPath], {
        timeout: 120_000,
        maxBuffer: 16 * 1024 * 1024,
      });
    } catch (err) {
      const detail =
        (err as { stderr?: string }).stderr?.trim() || (err as Error).message;
      throw new BadRequestException(`Tách nền thất bại: ${detail}`);
    }

    if (!existsSync(outPath)) {
      throw new BadRequestException('Tách nền không tạo được file kết quả');
    }
    const meta = await sharp(outPath).metadata();

    return {
      transparentUrl: this.publicUrl(
        `${this.rootPath}/${subFolder}/${fileName}`,
      ),
      fileName,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }
}
