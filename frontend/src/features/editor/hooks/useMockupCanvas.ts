import { useCallback, useEffect, useRef, useState } from 'react';
import { MockupCanvas } from '../lib/MockupCanvas';

/**
 * Khởi tạo MockupCanvas 1 lần, theo dõi selection + lịch sử undo/redo và gắn
 * phím tắt. Trả về ref gắn vào <canvas> + API điều khiển.
 */
export function useMockupCanvas(size = 1000) {
  const elRef = useRef<HTMLCanvasElement>(null);
  const ctrlRef = useRef<MockupCanvas | null>(null);
  const [ready, setReady] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!elRef.current) return;
    const ctrl = new MockupCanvas(elRef.current, size);
    ctrlRef.current = ctrl;
    setReady(true);

    const sync = () => {
      setHasSelection(!!ctrl.canvas.getActiveObject());
      setCanUndo(ctrl.canUndo());
      setCanRedo(ctrl.canRedo());
    };
    ctrl.onChange = sync;
    ctrl.canvas.on('selection:created', sync);
    ctrl.canvas.on('selection:updated', sync);
    ctrl.canvas.on('selection:cleared', sync);
    sync();

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable)
      ) {
        return; // đang gõ trong ô input -> bỏ qua
      }
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) void ctrl.redo();
        else void ctrl.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        void ctrl.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        void ctrl.duplicateSelected();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        ctrl.deleteSelected();
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        ctrl.nudge(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        ctrl.nudge(step, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        ctrl.nudge(0, -step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        ctrl.nudge(0, step);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      ctrl.dispose();
      ctrlRef.current = null;
      setReady(false);
    };
    // size cố định trong vòng đời editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctrl = useCallback(() => ctrlRef.current, []);

  return { elRef, ctrl, ready, hasSelection, canUndo, canRedo };
}
