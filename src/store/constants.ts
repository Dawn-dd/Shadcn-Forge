import { THEME_PRESETS } from '@/config/themes';

export const INITIAL_ITEMS = [];

export const DEFAULT_THEME = {
  ...THEME_PRESETS.Default,
  background: '#ffffff',
  foreground: '#0f172a',
  primaryForeground: '#ffffff',
  mutedForeground: '#64748b',
  border: '#e2e8f0',
  muted: '#f1f5f9',
  radius: 8,
  borderWidth: 1
};

export const DEFAULT_LAYOUT = {
  padding: 32,
  gap: 24,
  direction: 'column' as const,
  align: 'center' as const,
  backdrop: 'dots' as const,
  appBg: '#ffffff',
  workspaceBg: '#f1f5f9',
  radius: 16,
  borderWidth: 1
};