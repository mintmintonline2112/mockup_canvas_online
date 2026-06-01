// Mirror các model backend (Prisma) — §7 spec.

export interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  originalUrl: string;
  transparentUrl?: string | null;
  fileName: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface MockupTemplate {
  id: string;
  name: string;
  type: string;
  previewUrl?: string | null;
  canvasJson: Record<string, any>;
  createdAt: string;
}

export interface MockupProject {
  id: string;
  name: string;
  productId?: string | null;
  templateId?: string | null;
  canvasJson: Record<string, any>;
  exportUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Background {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  fileName: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface ExportPreset {
  key: string;
  label: string;
  width: number;
  height: number;
}

export interface UploadedImage {
  originalUrl: string;
  fileName: string;
  width: number;
  height: number;
}
