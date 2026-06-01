import type { RefObject } from 'react';

interface Props {
  elRef: RefObject<HTMLCanvasElement>;
}

/**
 * Vùng canvas 1:1. Kích thước nội bộ do Fabric quản lý (640px); export dùng
 * multiplier cao để ra ảnh nét, Sharp resize về đúng preset ở backend.
 */
export default function CanvasStage({ elRef }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-[#e9e9e6] p-8">
      <div className="rounded shadow-xl ring-1 ring-black/10">
        <canvas ref={elRef} />
      </div>
    </div>
  );
}
