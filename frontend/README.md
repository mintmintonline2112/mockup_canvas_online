# Mockup Canvas — Frontend (React + Vite + TS + Fabric.js + Tailwind)

Editor canvas cho product mockup tool. Layer system:
**Background → Template → Shadow → Product → Overlay** (`src/features/editor/lib/layers.ts`).

## Setup

```bash
cp .env.example .env   # để trống là dùng Vite proxy tới backend :3001
npm install
npm run dev            # http://localhost:5173
```

> Cần backend chạy ở `:3001` (xem `../backend`). Vite proxy `/api` và `/uploads`.

## Cấu trúc

```
src/
  core/
    http/api.ts            axios + unwrap { data } của TransformInterceptor
    services/mockup.service.ts
  models/                  type mirror Prisma model
  features/editor/
    EditorPage.tsx         ráp TopBar + LeftSidebar + CanvasStage
    components/            TopBar, LeftSidebar, CanvasStage
    hooks/useMockupCanvas  khởi tạo Fabric, theo dõi selection
    lib/
      layers.ts            LAYER_RANK + reorderLayers (z-index theo layer)
      MockupCanvas.ts      bao bọc Fabric: upload/shadow/reset/delete/export
      presets.ts           background + export preset (fallback)
```

## Luồng người dùng (§5)

Upload ảnh → chọn background preset → move/scale/rotate → add shadow → export
PNG/JPG (Sharp resize ở backend theo channel) → save canvas JSON.

Nguyên tắc: **product luôn là layer gốc, không tái tạo bằng AI.**
