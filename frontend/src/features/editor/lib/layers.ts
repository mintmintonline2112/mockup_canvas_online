import type { Canvas, FabricObject } from 'fabric';

/**
 * Layer system — product_mockup_canvas_mvp_structure.md §2.1
 *   Background → Template → Shadow → Product → Overlay
 * Mỗi object Fabric được gắn `mockupLayer`; thứ tự z dựa trên rank bên dưới.
 */
export type MockupLayer =
  | 'background'
  | 'template'
  | 'shadow'
  | 'product'
  | 'overlay';

export const LAYER_RANK: Record<MockupLayer, number> = {
  background: 0,
  template: 1,
  shadow: 2,
  product: 3,
  overlay: 4,
};

/** Property tuỳ biến cần đưa vào canvas.toJSON() để lưu/khôi phục đúng layer. */
export const CUSTOM_PROPS = [
  'mockupLayer',
  'groundingType',
  'selectable',
  'evented',
];

export function tagLayer(obj: FabricObject, layer: MockupLayer): FabricObject {
  (obj as any).mockupLayer = layer;
  return obj;
}

export function getLayer(obj: FabricObject): MockupLayer {
  return ((obj as any).mockupLayer as MockupLayer) ?? 'product';
}

/** Sắp lại z-index toàn canvas theo LAYER_RANK (ổn định trong cùng 1 layer). */
export function reorderLayers(canvas: Canvas): void {
  const sorted = [...canvas.getObjects()].sort(
    (a, b) => LAYER_RANK[getLayer(a)] - LAYER_RANK[getLayer(b)],
  );
  sorted.forEach((obj, index) => canvas.moveObjectTo(obj, index));
  canvas.requestRenderAll();
}

export function findByLayer(canvas: Canvas, layer: MockupLayer): FabricObject[] {
  return canvas.getObjects().filter((o) => getLayer(o) === layer);
}
