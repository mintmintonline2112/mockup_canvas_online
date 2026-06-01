// Channel export presets — product_mockup_canvas_mvp_structure.md §4.5
export interface ExportPreset {
  key: string;
  label: string;
  width: number;
  height: number;
}

export const EXPORT_PRESETS: Record<string, ExportPreset> = {
  'amazon-2000': { key: 'amazon-2000', label: 'Amazon 2000²', width: 2000, height: 2000 },
  'amazon-3000': { key: 'amazon-3000', label: 'Amazon/Etsy 3000²', width: 3000, height: 3000 },
  'social-1080': { key: 'social-1080', label: 'Social 1080²', width: 1080, height: 1080 },
  'web-banner': { key: 'web-banner', label: 'Website banner 1920×1080', width: 1920, height: 1080 },
};
