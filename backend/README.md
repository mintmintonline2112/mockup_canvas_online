# Mockup Canvas — Backend (NestJS + Prisma + PostgreSQL + Sharp)

Khung kế thừa từ `google-stacking-nestjs` (BaseService, TransformInterceptor,
AllExceptionsFilter, ConfigModule, Swagger, global prefix `/api`) nhưng chạy
trên **Prisma + PostgreSQL** thay cho TypeORM + MySQL.

## Setup

```bash
cp .env.example .env          # sửa DATABASE_URL trỏ tới Postgres của bạn
npm install
npm run prisma:generate
npm run prisma:migrate        # tạo bảng (dev) — đặt tên migration "init"
npm run db:seed               # seed 3 background preset
npm run start:dev
```

- API: http://localhost:3001/api
- Swagger: http://localhost:3001/docs
- Ảnh tĩnh: http://localhost:3001/uploads/...

## Cấu trúc

```
src/
  common/        base.service, interceptors, filters, logger   (khung dùng chung)
  config/        app-config.module, server.config, env.validation
  prisma/        prisma.service / prisma.module (global)
  modules/
    products/          Product + ProductImage (CRUD)
    mockup-templates/  Background preset (canvasJson)
    mockup-projects/   Lưu/mở canvas.toJSON()
    upload/            Upload ảnh sản phẩm (Sharp đọc metadata)
    export/            Sharp resize theo channel preset (Amazon/Etsy/Social/Web)
```

## Endpoint chính

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/upload/product-image` | Upload ảnh gốc (multipart `file`) |
| GET/POST/PUT/DELETE | `/api/products` | CRUD sản phẩm |
| POST | `/api/products/:id/images` | Gắn ảnh vào sản phẩm |
| GET/POST/... | `/api/mockup-templates` | Background preset |
| GET/POST/... | `/api/mockup-projects` | Lưu/mở canvas JSON |
| GET | `/api/export/presets` | Danh sách channel preset |
| POST | `/api/export` | Export ảnh (Sharp resize) |
