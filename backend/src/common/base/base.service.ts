import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Delegate tối thiểu mà 1 Prisma model expose (Product, MockupProject, ...).
 * Giữ generic lỏng để mọi service con chỉ cần truyền `prisma.<model>` vào super().
 */
export interface PrismaDelegate {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
}

/**
 * Base CRUD + pagination/search dùng chung cho mọi module — tương đương
 * BaseService bên google-stacking-nestjs nhưng chạy trên Prisma thay vì TypeORM.
 */
export class BaseService<Delegate extends PrismaDelegate> {
  constructor(protected readonly model: Delegate) {}

  async create(data: any): Promise<any> {
    return this.model.create({ data });
  }

  async findOne(id: string, args: any = {}): Promise<any> {
    const entity = await this.model.findUnique({ where: { id }, ...args });
    if (!entity) throw new NotFoundException(`Entity ${id} not found`);
    return entity;
  }

  async update(id: string, data: any): Promise<any> {
    await this.findOne(id);
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<{ id: string; deleted: true }> {
    await this.findOne(id);
    await this.model.delete({ where: { id } });
    return { id, deleted: true };
  }

  /**
   * Phân trang + tìm kiếm (insensitive contains) + filter động.
   * @param searchFields các field string để OR contains theo `search`.
   */
  async paginate(opts: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    searchFields?: string[];
    filters?: Record<string, any>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    include?: any;
  }) {
    const page = Number(opts.page ?? 1);
    const limit = Number(opts.limit ?? 10);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    const where: any = { ...this.cleanFilters(opts.filters) };

    if (opts.search && opts.searchFields?.length) {
      where.OR = opts.searchFields.map((field) => ({
        [field]: { contains: opts.search, mode: 'insensitive' },
      }));
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy: opts.orderBy ?? { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        ...(opts.include ? { include: opts.include } : {}),
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  protected cleanFilters(filters: Record<string, any> = {}): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        out[key] = value;
      }
    }
    return out;
  }
}
