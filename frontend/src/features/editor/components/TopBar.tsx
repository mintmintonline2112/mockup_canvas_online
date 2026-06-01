interface Props {
  projectName: string;
  onChangeName: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  isExisting: boolean;
  onOpenProjects: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function TopBar(props: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-black/10 bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg">🧺</span>
        <span className="font-semibold text-ink">Mockup Canvas</span>
        <span className="text-black/20">/</span>
        <input
          value={props.projectName}
          onChange={(e) => props.onChangeName(e.target.value)}
          className="rounded px-2 py-1 text-sm outline-none hover:bg-black/5 focus:bg-black/5"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={props.onUndo}
          disabled={!props.canUndo}
          title="Hoàn tác (Ctrl+Z)"
          className="rounded-md border border-black/15 px-2.5 py-1.5 text-sm hover:bg-black/5 disabled:opacity-40"
        >
          ↶
        </button>
        <button
          onClick={props.onRedo}
          disabled={!props.canRedo}
          title="Làm lại (Ctrl+Shift+Z)"
          className="rounded-md border border-black/15 px-2.5 py-1.5 text-sm hover:bg-black/5 disabled:opacity-40"
        >
          ↷
        </button>
        <button
          onClick={props.onOpenProjects}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
        >
          Mở project
        </button>
        <button
          onClick={props.onSave}
          disabled={props.saving}
          className="rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {props.saving
            ? 'Đang lưu…'
            : props.isExisting
              ? 'Lưu thay đổi'
              : 'Save project'}
        </button>
      </div>
    </header>
  );
}
