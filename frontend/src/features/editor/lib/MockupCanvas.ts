import { Canvas, FabricImage, Rect, Shadow, type FabricObject } from 'fabric';
import {
  CUSTOM_PROPS,
  findByLayer,
  getLayer,
  reorderLayers,
  tagLayer,
} from './layers';

const SOFT_SHADOW = {
  color: 'rgba(0,0,0,0.28)',
  blur: 38,
  offsetX: 0,
  offsetY: 26,
};

type GroundingType = 'shadow' | 'reflection';

function grounding(obj: FabricObject): GroundingType | undefined {
  return (obj as any).groundingType;
}

/**
 * Bao bọc Fabric.js Canvas, thực thi nguyên tắc layer + "giữ product là layer gốc".
 * Mọi thao tác sidebar gọi qua đây.
 */
export class MockupCanvas {
  readonly canvas: Canvas;

  /** Gọi sau mỗi thay đổi để UI cập nhật (undo/redo/selection). */
  onChange?: () => void;

  private readonly undoStack: string[] = [];
  private readonly redoStack: string[] = [];
  private restoring = false; // đang load lại JSON -> không ghi history
  private suspend = false; // đang chỉnh grounding tự động -> không ghi history

  constructor(el: HTMLCanvasElement, size = 1000) {
    this.canvas = new Canvas(el, {
      width: size,
      height: size,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });
    this.ensureBackground('#fbfbf8');
    this.ensureOverlayGuide();

    // History + grounding follow.
    this.canvas.on('object:added', () => this.record());
    this.canvas.on('object:removed', () => this.record());
    this.canvas.on('object:modified', (e) => {
      this.updateGrounding(e.target ?? undefined);
      this.record();
    });
    const live = (e: any) => this.updateGrounding(e?.target ?? undefined);
    this.canvas.on('object:moving', live);
    this.canvas.on('object:scaling', live);
    this.canvas.on('object:rotating', live);

    this.resetHistory();
  }

  // ===================================================================
  //  History (undo / redo)
  // ===================================================================
  private snapshot(): string {
    return JSON.stringify(this.toJSON());
  }

  private record() {
    if (this.restoring || this.suspend) return;
    const snap = this.snapshot();
    if (snap === this.undoStack[this.undoStack.length - 1]) return;
    this.undoStack.push(snap);
    if (this.undoStack.length > 60) this.undoStack.shift();
    this.redoStack.length = 0;
    this.onChange?.();
  }

  private resetHistory() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.undoStack.push(this.snapshot());
    this.onChange?.();
  }

  private async restore(json: string) {
    this.restoring = true;
    await this.canvas.loadFromJSON(JSON.parse(json));
    reorderLayers(this.canvas);
    this.canvas.requestRenderAll();
    this.restoring = false;
    this.onChange?.();
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  async undo() {
    if (!this.canUndo()) return;
    this.redoStack.push(this.undoStack.pop()!);
    await this.restore(this.undoStack[this.undoStack.length - 1]);
  }

  async redo() {
    const next = this.redoStack.pop();
    if (!next) return;
    this.undoStack.push(next);
    await this.restore(next);
  }

  // ===================================================================
  //  Layer 1: Background (Rect màu HOẶC ảnh phủ kín, không tương tác)
  // ===================================================================
  private ensureBackground(color: string) {
    // Dọn mọi background không phải Rect (vd ảnh nền cũ) rồi đảm bảo 1 Rect màu.
    const existing = findByLayer(this.canvas, 'background');
    const rect = existing.find((o) => o instanceof Rect) as Rect | undefined;
    existing.filter((o) => o !== rect).forEach((o) => this.canvas.remove(o));

    if (!rect) {
      const bg = new Rect({
        left: 0,
        top: 0,
        width: this.canvas.getWidth(),
        height: this.canvas.getHeight(),
        fill: color,
        selectable: false,
        evented: false,
      });
      tagLayer(bg, 'background');
      this.canvas.add(bg);
    } else {
      rect.set('fill', color);
    }
    reorderLayers(this.canvas);
  }

  setBackground(color: string) {
    this.ensureBackground(color);
    this.canvas.requestRenderAll();
  }

  /** Đặt ảnh nền từ thư viện — phủ kín canvas (cover), thay nền màu/ảnh cũ. */
  async setBackgroundImage(url: string) {
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const cw = this.canvas.getWidth();
    const ch = this.canvas.getHeight();
    const scale = Math.max(cw / (img.width || 1), ch / (img.height || 1));
    img.scale(scale);
    img.set({
      left: cw / 2,
      top: ch / 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    tagLayer(img, 'background');

    findByLayer(this.canvas, 'background').forEach((o) => this.canvas.remove(o));
    this.canvas.add(img);
    reorderLayers(this.canvas);
    this.canvas.requestRenderAll();
  }

  // ---- Layer 5: Overlay (khung export 1:1, chỉ là guide mờ) ----
  private ensureOverlayGuide() {
    if (findByLayer(this.canvas, 'overlay').length) return;
    const frame = new Rect({
      left: 0,
      top: 0,
      width: this.canvas.getWidth() - 2,
      height: this.canvas.getHeight() - 2,
      fill: 'transparent',
      stroke: 'rgba(0,0,0,0.06)',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
    tagLayer(frame, 'overlay');
    this.canvas.add(frame);
    reorderLayers(this.canvas);
  }

  // ===================================================================
  //  Layer 4: Product (ảnh gốc, KHÔNG tái tạo)
  // ===================================================================
  async addProductFromUrl(url: string): Promise<FabricObject> {
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });

    // Auto-fit ~70% canvas, giữ nguyên tỉ lệ.
    const target = this.canvas.getWidth() * 0.7;
    const scale = Math.min(
      target / (img.width || 1),
      target / (img.height || 1),
    );
    img.scale(scale);
    img.set({
      left: this.canvas.getWidth() / 2,
      top: this.canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
    });
    tagLayer(img, 'product');

    this.canvas.add(img);
    reorderLayers(this.canvas);
    this.canvas.setActiveObject(img);
    this.canvas.requestRenderAll();
    return img;
  }

  /** URL ảnh của product hiện tại (để gửi đi tách nền). */
  getProductSrc(): string | undefined {
    const product = this.getProduct();
    if (!product || !(product instanceof FabricImage)) return undefined;
    return product.getSrc();
  }

  /**
   * Thay ảnh product bằng phiên bản đã tách nền — giữ nguyên vị trí/scale/góc
   * (ảnh nobg cùng kích thước pixel nên scale không đổi).
   */
  async replaceProductSrc(url: string) {
    const product = this.getProduct();
    if (!product || !(product instanceof FabricImage)) return;
    await product.setSrc(url, { crossOrigin: 'anonymous' });
    this.canvas.requestRenderAll();
    this.record();
  }

  private getProduct(): FabricObject | undefined {
    const active = this.canvas.getActiveObject();
    if (active && getLayer(active) === 'product') return active;
    return findByLayer(this.canvas, 'product')[0] ?? undefined;
  }

  hasProduct(): boolean {
    return findByLayer(this.canvas, 'product').length > 0;
  }

  // ===================================================================
  //  Object actions (selection hiện tại)
  // ===================================================================
  private editableActive(): FabricObject | undefined {
    const active = this.canvas.getActiveObject();
    if (!active) return undefined;
    const layer = getLayer(active);
    if (layer === 'background' || layer === 'overlay') return undefined;
    if (grounding(active)) return undefined; // không cho chỉnh trực tiếp bóng/phản chiếu
    return active;
  }

  async duplicateSelected() {
    const active = this.editableActive();
    if (!active) return;
    const clone = await active.clone(CUSTOM_PROPS);
    clone.set({
      left: (active.left ?? 0) + 30,
      top: (active.top ?? 0) + 30,
    });
    tagLayer(clone, getLayer(active));
    this.canvas.add(clone);
    reorderLayers(this.canvas);
    this.canvas.setActiveObject(clone);
    this.canvas.requestRenderAll();
  }

  flipSelected(axis: 'x' | 'y') {
    const active = this.editableActive();
    if (!active) return;
    const key = axis === 'x' ? 'flipX' : 'flipY';
    active.set(key, !(active as any)[key]);
    this.canvas.requestRenderAll();
    this.record();
  }

  setOpacity(percent: number) {
    const active = this.editableActive();
    if (!active) return;
    active.set('opacity', Math.min(1, Math.max(0, percent / 100)));
    this.canvas.requestRenderAll();
    this.record();
  }

  getOpacity(): number {
    const active = this.editableActive();
    return active ? Math.round((active.opacity ?? 1) * 100) : 100;
  }

  centerSelected() {
    const active = this.editableActive();
    if (!active) return;
    this.canvas.viewportCenterObject(active);
    active.setCoords();
    this.updateGrounding(active);
    this.canvas.requestRenderAll();
    this.record();
  }

  nudge(dx: number, dy: number) {
    const active = this.editableActive();
    if (!active) return;
    active.set({ left: (active.left ?? 0) + dx, top: (active.top ?? 0) + dy });
    active.setCoords();
    this.updateGrounding(active);
    this.canvas.requestRenderAll();
    this.record();
  }

  resetProduct() {
    const product = this.getProduct();
    if (!product) return;
    product.set({
      left: this.canvas.getWidth() / 2,
      top: this.canvas.getHeight() / 2,
      angle: 0,
      originX: 'center',
      originY: 'center',
    });
    const target = this.canvas.getWidth() * 0.7;
    const scale = Math.min(
      target / ((product as any).width || 1),
      target / ((product as any).height || 1),
    );
    product.scale(scale);
    product.setCoords();
    this.updateGrounding(product);
    this.canvas.requestRenderAll();
    this.record();
  }

  deleteSelected() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    const layer = getLayer(active);
    if (layer === 'background' || layer === 'overlay') return;
    this.canvas.remove(active);
    this.canvas.discardActiveObject();
    // Nếu xoá hết product thì bỏ luôn grounding mồ côi.
    if (!this.hasProduct()) {
      this.findGrounding('shadow')
        .concat(this.findGrounding('reflection'))
        .forEach((o) => this.canvas.remove(o));
    }
    this.canvas.requestRenderAll();
  }

  // ===================================================================
  //  Layer 3: Grounding — bóng tiếp xúc + phản chiếu (đi theo product)
  // ===================================================================
  private findGrounding(type: GroundingType): FabricObject[] {
    return this.canvas.getObjects().filter((o) => grounding(o) === type);
  }

  /** Toggle bóng đổ mềm trên product (drop-shadow). */
  toggleShadow(): boolean {
    const product = this.getProduct();
    if (!product) return false;
    // Dọn mọi ellipse "bóng tiếp xúc" cũ (đã bỏ — trông giả khi product bay).
    this.findGrounding('shadow').forEach((o) => this.canvas.remove(o));

    const has = !!product.shadow;
    product.set('shadow', has ? null : new Shadow(SOFT_SHADOW));
    this.canvas.requestRenderAll();
    this.record();
    return !has;
  }

  /** Toggle phản chiếu: bản sao lật dọc mờ dần dưới product. */
  async toggleReflection(): Promise<boolean> {
    const product = this.getProduct();
    if (!product || !(product instanceof FabricImage)) return false;
    const existing = this.findGrounding('reflection');

    if (existing.length) {
      existing.forEach((o) => this.canvas.remove(o));
      this.canvas.requestRenderAll();
      this.record();
      return false;
    }

    const refl = await product.clone(CUSTOM_PROPS);
    (refl as any).groundingType = 'reflection';
    refl.set({
      flipY: true,
      opacity: 0.22,
      selectable: false,
      evented: false,
      angle: 0,
    });
    tagLayer(refl, 'shadow');
    this.suspend = true;
    this.canvas.add(refl);
    reorderLayers(this.canvas);
    this.suspend = false;
    this.updateGrounding(product);
    this.canvas.requestRenderAll();
    this.record();
    return true;
  }

  /** Định vị lại phản chiếu theo bounding box của product (gọi khi product đổi). */
  private updateGrounding(target?: FabricObject) {
    if (this.suspend || this.restoring) return;
    const reflections = this.findGrounding('reflection');
    if (!reflections.length) return;

    // Nếu sự kiện đến từ chính grounding thì bỏ qua; lấy product để bám.
    const product =
      target && getLayer(target) === 'product' && !grounding(target)
        ? target
        : this.getProduct();
    if (!product) return;

    const br = product.getBoundingRect();
    const cx = br.left + br.width / 2;
    const bottom = br.top + br.height;

    this.suspend = true;
    for (const r of reflections) {
      r.set({
        originX: 'center',
        originY: 'top',
        left: cx,
        top: bottom,
        scaleX: (product as FabricImage).scaleX,
        scaleY: (product as FabricImage).scaleY,
        flipX: (product as any).flipX,
        flipY: true,
        angle: 0,
      });
      r.setCoords();
    }
    this.suspend = false;
  }

  // ===================================================================
  //  Save / Load (Canvas JSON logic §8)
  // ===================================================================
  toJSON(): Record<string, any> {
    // Fabric v6: truyền propertiesToInclude qua toObject (toJSON không nhận arg).
    return this.canvas.toObject(CUSTOM_PROPS) as Record<string, any>;
  }

  async loadJSON(json: Record<string, any>) {
    this.restoring = true;
    await this.canvas.loadFromJSON(json);
    reorderLayers(this.canvas);
    this.canvas.requestRenderAll();
    this.restoring = false;
    this.resetHistory(); // mở project mới -> history bắt đầu lại
  }

  // ---- Export: render PNG dataURL ở multiplier cao để Sharp resize ----
  exportDataURL(multiplier = 3): string {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    return this.canvas.toDataURL({ format: 'png', multiplier });
  }

  dispose() {
    void this.canvas.dispose();
  }
}
