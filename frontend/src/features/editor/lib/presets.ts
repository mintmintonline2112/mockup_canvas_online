// Background presets — đồng bộ với backend seed (§4.3).
// Dùng làm fallback khi chưa fetch được template từ API.

export interface BackgroundPreset {
  type: string;
  name: string;
  background: string;
  mood: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    type: 'white-studio',
    name: 'White Studio',
    background: '#fbfbf8',
    mood: 'Amazon/Etsy · soft daylight',
  },
  {
    type: 'minimal-interior',
    name: 'Minimal Interior',
    background: '#ece8e1',
    mood: 'Lifestyle · neutral premium',
  },
  {
    type: 'pastel-sunlight',
    name: 'Pastel Sunlight',
    background: '#fdeede',
    mood: 'Social · warm sunlight',
  },
];

// Channel export presets (fallback nếu API /export/presets lỗi).
export const EXPORT_PRESETS = [
  { key: 'amazon-2000', label: 'Amazon 2000²', width: 2000, height: 2000 },
  { key: 'amazon-3000', label: 'Amazon/Etsy 3000²', width: 3000, height: 3000 },
  { key: 'social-1080', label: 'Social 1080²', width: 1080, height: 1080 },
  { key: 'web-banner', label: 'Website 1920×1080', width: 1920, height: 1080 },
];
