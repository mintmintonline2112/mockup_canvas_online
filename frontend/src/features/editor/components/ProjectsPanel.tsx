import type { MockupProject } from '../../../models';

interface Props {
  open: boolean;
  loading: boolean;
  projects: MockupProject[];
  currentId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ProjectsPanel(props: Props) {
  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={props.onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
          <h2 className="font-semibold text-ink">Project đã lưu</h2>
          <button
            onClick={props.onClose}
            className="h-7 w-7 rounded-full text-black/50 hover:bg-black/5"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {props.loading ? (
            <p className="p-6 text-center text-sm text-black/40">Đang tải…</p>
          ) : props.projects.length === 0 ? (
            <p className="p-6 text-center text-sm text-black/40">
              Chưa có project nào. Bấm “Save project” để lưu canvas hiện tại.
            </p>
          ) : (
            <ul className="space-y-1">
              {props.projects.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                    p.id === props.currentId
                      ? 'border-ink bg-ink/5'
                      : 'border-black/10 hover:bg-black/5'
                  }`}
                >
                  <button
                    onClick={() => props.onOpen(p.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm font-medium">
                      {p.name}
                      {p.id === props.currentId && (
                        <span className="ml-2 text-xs text-ink/60">
                          (đang mở)
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-black/40">
                      {formatDate(p.updatedAt)}
                    </span>
                  </button>
                  <button
                    onClick={() => props.onDelete(p.id)}
                    title="Xoá project"
                    className="ml-3 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Xoá
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
