import { api } from '../http/api';
import type {
  Background,
  ExportPreset,
  MockupProject,
  MockupTemplate,
  UploadedImage,
} from '../../models';

export const mockupService = {
  // ---- Upload ----
  async uploadProductImage(file: File): Promise<UploadedImage> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/api/upload/product-image', form);
    return data;
  },

  async removeProductBackground(imageUrl: string): Promise<{
    transparentUrl: string;
    fileName: string;
    width: number;
    height: number;
  }> {
    const { data } = await api.post('/api/upload/remove-background', {
      imageUrl,
    });
    return data;
  },

  // ---- Background library ----
  async listBackgrounds(): Promise<Background[]> {
    const { data } = await api.get('/api/backgrounds', {
      params: { limit: 100 },
    });
    return data.data ?? data;
  },

  async uploadBackground(file: File, name?: string): Promise<Background> {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    const { data } = await api.post('/api/backgrounds/upload', form);
    return data;
  },

  async deleteBackground(id: string): Promise<void> {
    await api.delete(`/api/backgrounds/${id}`);
  },

  // ---- Templates (background preset) ----
  async listTemplates(): Promise<MockupTemplate[]> {
    const { data } = await api.get('/api/mockup-templates', {
      params: { limit: 50 },
    });
    return data.data ?? data;
  },

  // ---- Projects (canvas save/load) ----
  async saveProject(payload: {
    name?: string;
    productId?: string;
    templateId?: string;
    canvasJson: Record<string, any>;
  }): Promise<MockupProject> {
    const { data } = await api.post('/api/mockup-projects', payload);
    return data;
  },

  async getProject(id: string): Promise<MockupProject> {
    const { data } = await api.get(`/api/mockup-projects/${id}`);
    return data;
  },

  async listProjects(): Promise<MockupProject[]> {
    const { data } = await api.get('/api/mockup-projects', {
      params: { limit: 100 },
    });
    return data.data ?? data;
  },

  async updateProject(
    id: string,
    payload: { name?: string; canvasJson?: Record<string, any> },
  ): Promise<MockupProject> {
    const { data } = await api.put(`/api/mockup-projects/${id}`, payload);
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/api/mockup-projects/${id}`);
  },

  // ---- Export ----
  async listExportPresets(): Promise<ExportPreset[]> {
    const { data } = await api.get('/api/export/presets');
    return data;
  },

  async exportImage(payload: {
    dataUrl: string;
    preset: string;
    format?: 'png' | 'jpg';
  }): Promise<{ url: string; fileName: string; bytes: number }> {
    const { data } = await api.post('/api/export', payload);
    return data;
  },
};
