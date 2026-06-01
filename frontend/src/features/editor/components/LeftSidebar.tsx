import { useRef, useState } from 'react';
import type { Background, ExportPreset } from '../../../models';
import { BACKGROUND_PRESETS } from '../lib/presets';

interface Props {
  hasSelection: boolean;
  qualityWarning: string | null;
  uploading: boolean;
  exporting: boolean;
  exportPresets: ExportPreset[];
  exportResult: { url: string; bytes: number } | null;
  backgrounds: Background[];
  uploadingBg: boolean;
  removingBg: boolean;
  onUpload: (file: File) => void;
  onRemoveBackground: () => void;
  onPickBackground: (type: string, color: string) => void;
  onUploadBackground: (file: File) => void;
  onPickBackgroundImage: (url: string) => void;
  onDeleteBackground: (id: string) => void;
  onDuplicate: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onCenter: () => void;
  onOpacity: (percent: number) => void;
  onToggleShadow: () => void;
  onToggleReflection: () => void;
  onReset: () => void;
  onDelete: () => void;
  onExport: (presetKey: string, format: 'png' | 'jpg') => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-black/10 px-4 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function LeftSidebar(props: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [activeBg, setActiveBg] = useState('white-studio');
  const [preset, setPreset] = useState('amazon-2000');
  const [format, setFormat] = useState<'png' | 'jpg'>('png');

  return (
    <aside className="flex w-72 flex-col overflow-y-auto border-r border-black/10 bg-panel">
      {/* 1. Upload */}
      <Section title="Product image">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) props.onUpload(f);
            e.target.value = '';
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={props.uploading}
          className="w-full rounded-md border border-dashed border-black/25 py-3 text-sm text-black/70 hover:bg-black/5 disabled:opacity-50"
        >
          {props.uploading ? 'Đang tải…' : '⬆ Upload PNG / JPG / WEBP'}
        </button>
        {props.qualityWarning && (
          <p className="mt-2 text-xs text-amber-700">⚠ {props.qualityWarning}</p>
        )}
        <button
          onClick={props.onRemoveBackground}
          disabled={props.removingBg}
          className="mt-2 w-full rounded-md border border-black/15 bg-white py-2 text-sm hover:bg-black/5 disabled:opacity-50"
        >
          {props.removingBg ? 'Đang tách nền…' : '✂ Tách nền sản phẩm'}
        </button>
        <p className="mt-1 text-xs text-black/40">
          Xoá nền ảnh sản phẩm (chạy local), giữ nguyên pixel sản phẩm.
        </p>
      </Section>

      {/* 2. Background preset */}
      <Section title="Background preset">
        <div className="space-y-2">
          {BACKGROUND_PRESETS.map((bg) => (
            <button
              key={bg.type}
              onClick={() => {
                setActiveBg(bg.type);
                props.onPickBackground(bg.type, bg.background);
              }}
              className={`flex w-full items-center gap-3 rounded-md border p-2 text-left text-sm ${
                activeBg === bg.type
                  ? 'border-ink ring-1 ring-ink'
                  : 'border-black/10 hover:bg-black/5'
              }`}
            >
              <span
                className="h-8 w-8 rounded ring-1 ring-black/10"
                style={{ background: bg.background }}
              />
              <span>
                <span className="block font-medium">{bg.name}</span>
                <span className="block text-xs text-black/45">{bg.mood}</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* 3. Background library */}
      <Section title="Background library">
        <input
          ref={bgFileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) props.onUploadBackground(f);
            e.target.value = '';
          }}
        />
        <button
          onClick={() => bgFileRef.current?.click()}
          disabled={props.uploadingBg}
          className="mb-3 w-full rounded-md border border-dashed border-black/25 py-2 text-sm text-black/70 hover:bg-black/5 disabled:opacity-50"
        >
          {props.uploadingBg ? 'Đang tải…' : '⬆ Thêm ảnh nền vào thư viện'}
        </button>

        {props.backgrounds.length === 0 ? (
          <p className="text-xs text-black/40">
            Chưa có ảnh nền. Upload để dùng lại sau này.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {props.backgrounds.map((bg) => (
              <div key={bg.id} className="group relative">
                <button
                  onClick={() => props.onPickBackgroundImage(bg.imageUrl)}
                  title={bg.name}
                  className="block aspect-square w-full overflow-hidden rounded-md border border-black/10 hover:ring-2 hover:ring-ink"
                >
                  <img
                    src={bg.thumbnailUrl || bg.imageUrl}
                    alt={bg.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
                <button
                  onClick={() => props.onDeleteBackground(bg.id)}
                  title="Xoá khỏi thư viện"
                  className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 4. Object actions */}
      <Section title="Object actions">
        <div className="grid grid-cols-2 gap-2">
          <ActionBtn onClick={props.onDuplicate} disabled={!props.hasSelection}>
            Nhân bản
          </ActionBtn>
          <ActionBtn onClick={props.onCenter} disabled={!props.hasSelection}>
            Căn giữa
          </ActionBtn>
          <ActionBtn onClick={props.onFlipH} disabled={!props.hasSelection}>
            Lật ngang
          </ActionBtn>
          <ActionBtn onClick={props.onFlipV} disabled={!props.hasSelection}>
            Lật dọc
          </ActionBtn>
          <ActionBtn onClick={props.onReset}>Reset product</ActionBtn>
          <ActionBtn onClick={props.onDelete} disabled={!props.hasSelection}>
            Xoá
          </ActionBtn>
        </div>

        <label className="mt-3 block text-xs text-black/50">Opacity</label>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={100}
          disabled={!props.hasSelection}
          onChange={(e) => props.onOpacity(Number(e.target.value))}
          className="w-full accent-ink disabled:opacity-40"
        />

        <p className="mt-2 text-xs text-black/40">
          Kéo để di chuyển · góc để scale/xoay · phím Del để xoá, mũi tên để
          nhích, Ctrl+Z hoàn tác. Product luôn là layer gốc.
        </p>
      </Section>

      {/* 4b. Grounding */}
      <Section title="Bóng đổ & phản chiếu">
        <div className="grid grid-cols-2 gap-2">
          <ActionBtn onClick={props.onToggleShadow}>Bóng đổ</ActionBtn>
          <ActionBtn onClick={props.onToggleReflection}>Phản chiếu</ActionBtn>
        </div>
        <p className="mt-2 text-xs text-black/40">
          Bật/tắt — tự bám theo sản phẩm khi di chuyển hoặc scale.
        </p>
      </Section>

      {/* 5. Export */}
      <Section title="Export">
        <label className="mb-1 block text-xs text-black/50">Channel preset</label>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          className="mb-2 w-full rounded-md border border-black/15 bg-white px-2 py-1.5 text-sm"
        >
          {props.exportPresets.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

        <div className="mb-3 flex gap-2">
          {(['png', 'jpg'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 rounded-md border py-1 text-sm uppercase ${
                format === f
                  ? 'border-ink bg-ink text-white'
                  : 'border-black/15'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => props.onExport(preset, format)}
          disabled={props.exporting}
          className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {props.exporting ? 'Đang export…' : '⬇ Export image'}
        </button>

        {props.exportResult && (
          <a
            href={props.exportResult.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate text-xs text-emerald-700 underline"
          >
            ✓ {(props.exportResult.bytes / 1024).toFixed(0)} KB — mở ảnh
          </a>
        )}
      </Section>
    </aside>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-black/15 bg-white py-1.5 text-sm hover:bg-black/5 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
