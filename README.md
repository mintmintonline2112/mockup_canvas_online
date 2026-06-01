# Product Mockup Canvas Tool

Internal tool to create mockups of handmade products (water hyacinth baskets/bags...) using **Fabric.js
Canvas**, keep the product image as the **original layer** (not recreated by AI). Full Specs:
`product_mockup_canvas_mvp_structure.md`.

The framework inherits pattern from `google-stacking-nestjs` (monorepo backend/frontend,
BaseService, TransformInterceptor, AllExceptionsFilter, ConfigModule, Swagger,
global prefix `/api`).

## Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React + TypeScript + Fabric.js + Tailwind CSS (Vite) |
| Backend | NestJS (Node) |
| Database | PostgreSQL |
| ORM | Prisma |
| Image processing | Sharp.js |

Layer system: **Background → Template → Shadow → Product → Overlay**

## Cấu trúc

```
product-mockup-canvas/
  backend/    NestJS + Prisma + PostgreSQL + Sharp   (xem backend/README.md)
  frontend/   React + Vite + Fabric.js + Tailwind    (xem frontend/README.md)
```

## Chạy nhanh

```bash
# 1) Backend
cd backend
cp .env.example .env          # sửa DATABASE_URL trỏ Postgres
npm install
npm run prisma:generate
npm run prisma:migrate        # tên migration: init
npm run db:seed               # 3 background preset
npm run start:dev             # :3001  (Swagger /docs)

# 2) Frontend (terminal khác)
cd frontend
cp .env.example .env
npm install
npm run dev                   # :5173
```

## Roadmap (theo spec §9)

- **Phase 1 — MVP (đang dựng):** upload, canvas editing, background preset, shadow, export PNG/JPG, save canvas JSON.
- **Phase 2:** SKU management, template library, batch export, auto resize, auto background removal.
- **Phase 3:** Semi-AI (AI làm background/lighting, KHÔNG tái tạo product).
- **Phase 4:** Multi-angle product image set.
