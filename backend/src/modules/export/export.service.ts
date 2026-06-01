import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { ServerConfig } from 'src/config/server.config';
import { ExportImageDto } from './dto/export-image.dto';
import { EXPORT_PRESETS } from './export.constants';

@Injectable()
export class ExportService {
  private readonly rootPath = 'uploads';

  constructor(private readonly config: ConfigService) {}

  listPresets() {
    return Object.values(EXPORT_PRESETS);
  }

  /**
   * Nhận PNG dataURL render từ Fabric.js, dùng Sharp resize "contain" về kích
   * thước preset của kênh, xuất PNG/JPG chất lượng cao và lưu uploads/exports.
   * Không tái tạo sản phẩm — chỉ resize ảnh đã render.
   */
  async exportImage(dto: ExportImageDto) {
    const preset = EXPORT_PRESETS[dto.preset];
    if (!preset) {
      throw new BadRequestException(`Unknown preset: ${dto.preset}`);
    }

    const base64 = dto.dataUrl.replace(/^data:image\/\w+;base64,/, '');
    if (!base64) throw new BadRequestException('Invalid dataUrl');
    const input = Buffer.from(base64, 'base64');

    const format = dto.format ?? 'png';
    let pipeline = sharp(input).resize(preset.width, preset.height, {
      fit: 'contain',
      background:
        format === 'jpg'
          ? { r: 255, g: 255, b: 255, alpha: 1 }
          : { r: 255, g: 255, b: 255, alpha: 0 },
    });

    pipeline =
      format === 'jpg'
        ? pipeline.jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
        : pipeline.png({ compressionLevel: 9 });

    const buffer = await pipeline.toBuffer();

    const subFolder = 'exports';
    const dir = join(process.cwd(), this.rootPath, subFolder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const suffix = Math.random().toString(36).slice(2, 8);
    const fileName = `${preset.key}-${suffix}.${format}`;
    await writeFile(join(dir, fileName), buffer);

    const server = this.config.get<ServerConfig>('server');
    const url = `${server?.publicBaseUrl ?? ''}/${this.rootPath}/${subFolder}/${fileName}`;

    return {
      url,
      fileName,
      preset: preset.key,
      width: preset.width,
      height: preset.height,
      format,
      bytes: buffer.length,
    };
  }
}
