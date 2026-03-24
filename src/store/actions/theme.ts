import { StateCreator } from 'zustand';
import { ForgeStore } from '@/types';
import { THEME_PRESETS } from '@/config/themes';

export interface ThemeActions {
  toggleDarkMode: () => void;
  updateTheme: (updates: Partial<ForgeStore['theme']>) => void; /** * 更新主题的函数类型定义 * @param updates - 包含主题更新内容的对象，是主题状态的部分更新 */
  applyPreset: (presetName: string) => void; /** * 应用预设主题的函数类型定义 * @param presetName - 要应用的预设主题的名称 */
}

export const createThemeActions: StateCreator<
  ForgeStore,
  [],
  [],
  ThemeActions
> = (set) => ({
  toggleDarkMode: () => //  切换深色模式的方法
    set((state) => {
      const isDark = !state.isDarkMode;
      return {
        isDarkMode: isDark,
        layout: {
          ...state.layout,
          appBg: isDark ? '#0c0a09' : '#ffffff',
          workspaceBg: isDark ? '#050505' : '#f1f5f9'
        },
        theme: {
          ...state.theme,
          background: isDark ? '#09090b' : '#ffffff',
          foreground: isDark ? '#f8fafc' : '#0f172a',
          border: isDark ? '#27272a' : '#e2e8f0',
          muted: isDark ? '#18181b' : '#f1f5f9'
        }
      };
    }),

  updateTheme: (updates) => //  更新主题的函数，接受一个updates对象来更新主题属性
    set((state) => ({
      theme: { ...state.theme, ...updates }
    })),

  applyPreset: (presetName) => //  应用预设主题的函数，接受预设名称作为参数
    set((state) => {
      const preset = THEME_PRESETS[presetName];
      return {
        theme: { ...state.theme, ...preset },
        layout: { //  更新布局设置，使用预设中的背景色或保持现有值
          ...state.layout,
          appBg: preset.appBg || state.layout.appBg,
          workspaceBg: preset.workspaceBg || state.layout.workspaceBg
        },
        isDarkMode: preset.isDark ?? state.isDarkMode
      };
    })
});