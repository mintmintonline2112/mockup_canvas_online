import { useEffect, useState } from 'react';
import { mockupService } from '../../core/services/mockup.service';
import type { Background, ExportPreset, MockupProject } from '../../models';
import CanvasStage from './components/CanvasStage';
import LeftSidebar from './components/LeftSidebar';
import ProjectsPanel from './components/ProjectsPanel';
import TopBar from './components/TopBar';
import { useMockupCanvas } from './hooks/useMockupCanvas';
import { EXPORT_PRESETS } from './lib/presets';

export default function EditorPage() {
  const { elRef, ctrl, ready, hasSelection, canUndo, canRedo } =
    useMockupCanvas(640);

  const [projectName, setProjectName] = useState('Untitled mockup');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [exportPresets, setExportPresets] = useState<ExportPreset[]>(
    EXPORT_PRESETS,
  );
  const [exportResult, setExportResult] = useState<{
    url: string;
    bytes: number;
  } | null>(null);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projects, setProjects] = useState<MockupProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    mockupService.listExportPresets().then(setExportPresets).catch(() => {});
    mockupService.listBackgrounds().then(setBackgrounds).catch(() => {});
  }, []);

  async function handleUploadBackground(file: File) {
    setUploadingBg(true);
    try {
      const bg = await mockupService.uploadBackground(file);
      setBackgrounds((prev) => [bg, ...prev]);
      await ctrl()?.setBackgroundImage(bg.imageUrl);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Upload background thất bại');
    } finally {
      setUploadingBg(false);
    }
  }

  async function handleRemoveBackground() {
    const c = ctrl();
    if (!c) return;
    const src = c.getProductSrc();
    if (!src) {
      alert('Hãy upload / chọn ảnh sản phẩm trước khi tách nền.');
      return;
    }
    setRemovingBg(true);
    try {
      const res = await mockupService.removeProductBackground(src);
      await c.replaceProductSrc(res.transparentUrl);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Tách nền thất bại');
    } finally {
      setRemovingBg(false);
    }
  }

  async function handleDeleteBackground(id: string) {
    try {
      await mockupService.deleteBackground(id);
      setBackgrounds((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Xoá background thất bại');
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setQualityWarning(null);
    try {
      const img = await mockupService.uploadProductImage(file);
      await ctrl()?.addProductFromUrl(img.originalUrl);
      if (Math.min(img.width, img.height) < 2000) {
        setQualityWarning(
          `Ảnh ${img.width}×${img.height}px — nên ≥ 2000px để export nét.`,
        );
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const c = ctrl();
    if (!c) return;
    setSaving(true);
    try {
      const canvasJson = c.toJSON();
      const saved = currentProjectId
        ? await mockupService.updateProject(currentProjectId, {
            name: projectName,
            canvasJson,
          })
        : await mockupService.saveProject({ name: projectName, canvasJson });
      setCurrentProjectId(saved.id);
      setProjectName(saved.name);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleOpenProjectsPanel() {
    setProjectsOpen(true);
    setProjectsLoading(true);
    try {
      setProjects(await mockupService.listProjects());
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Không tải được danh sách project');
    } finally {
      setProjectsLoading(false);
    }
  }

  async function handleOpenProject(id: string) {
    const c = ctrl();
    if (!c) return;
    try {
      const project = await mockupService.getProject(id);
      await c.loadJSON(project.canvasJson);
      setCurrentProjectId(project.id);
      setProjectName(project.name);
      setProjectsOpen(false);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Mở project thất bại');
    }
  }

  async function handleDeleteProject(id: string) {
    try {
      await mockupService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (id === currentProjectId) setCurrentProjectId(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Xoá project thất bại');
    }
  }

  async function handleExport(presetKey: string, format: 'png' | 'jpg') {
    const c = ctrl();
    if (!c) return;
    setExporting(true);
    setExportResult(null);
    try {
      const dataUrl = c.exportDataURL(5); // 640*5 = 3200px nguồn -> Sharp resize
      const res = await mockupService.exportImage({
        dataUrl,
        preset: presetKey,
        format,
      });
      setExportResult({ url: res.url, bytes: res.bytes });
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Export thất bại');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar
        projectName={projectName}
        onChangeName={setProjectName}
        onSave={handleSave}
        saving={saving}
        isExisting={!!currentProjectId}
        onOpenProjects={handleOpenProjectsPanel}
        onUndo={() => ctrl()?.undo()}
        onRedo={() => ctrl()?.redo()}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          hasSelection={hasSelection}
          qualityWarning={qualityWarning}
          uploading={uploading}
          exporting={exporting}
          exportPresets={exportPresets}
          exportResult={exportResult}
          backgrounds={backgrounds}
          uploadingBg={uploadingBg}
          removingBg={removingBg}
          onUpload={handleUpload}
          onRemoveBackground={handleRemoveBackground}
          onPickBackground={(_type, color) => ctrl()?.setBackground(color)}
          onUploadBackground={handleUploadBackground}
          onPickBackgroundImage={(url) => ctrl()?.setBackgroundImage(url)}
          onDeleteBackground={handleDeleteBackground}
          onDuplicate={() => ctrl()?.duplicateSelected()}
          onFlipH={() => ctrl()?.flipSelected('x')}
          onFlipV={() => ctrl()?.flipSelected('y')}
          onCenter={() => ctrl()?.centerSelected()}
          onOpacity={(percent) => ctrl()?.setOpacity(percent)}
          onToggleShadow={() => ctrl()?.toggleShadow()}
          onToggleReflection={() => ctrl()?.toggleReflection()}
          onReset={() => ctrl()?.resetProduct()}
          onDelete={() => ctrl()?.deleteSelected()}
          onExport={handleExport}
        />
        <CanvasStage elRef={elRef} />
      </div>

      <ProjectsPanel
        open={projectsOpen}
        loading={projectsLoading}
        projects={projects}
        currentId={currentProjectId}
        onClose={() => setProjectsOpen(false)}
        onOpen={handleOpenProject}
        onDelete={handleDeleteProject}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-black/40">
          Đang khởi tạo canvas…
        </div>
      )}
    </div>
  );
}
