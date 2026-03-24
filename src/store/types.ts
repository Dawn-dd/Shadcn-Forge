import { ComponentItem, Theme, Layout, AISessionEntry, PreviewViewport } from '@/types';

/**
 * Forge Store 状态类型
 */
export interface ForgeStoreState {
  // 主题相关
  isDarkMode: boolean;
  theme: Theme;

  // 布局相关
  layout: Layout;

  // 画布组件
  canvasItems: ComponentItem[];

  // 剪贴板
  clipboardItems: ComponentItem[];

  // 选中状态
  activeComponentId: string | null;
  selectedComponentIds: string[];

  // 预览模式
  isPreviewMode: boolean;
  previewViewport: PreviewViewport;

  // 历史记录
  history: ComponentItem[][];
  historyStep: number;

  // AI 会话日志
  aiSessionLog: AISessionEntry[];
}

/**
 * 历史记录操作
 */
export interface HistoryActions {
  _saveHistory: (newItems: ComponentItem[]) => {
    canvasItems: ComponentItem[];
    history: ComponentItem[][];
    historyStep: number;
  };
  undo: () => void;
  redo: () => void;
}

/**
 * 主题相关操作
 */
export interface ThemeActions {
  toggleDarkMode: () => void;
  updateTheme: (updates: Partial<Theme>) => void;
  applyPreset: (presetName: string) => void;
}

/**
 * 布局相关操作
 */
export interface LayoutActions {
  updateLayout: (updates: Partial<Layout>) => void;
  togglePreviewMode: () => void;
  setPreviewViewport: (viewport: PreviewViewport) => void;
}

/**
 * 组件操作
 */
export interface ComponentActions {
    addComponent: (type: string) => void;
    addComponentToCard: (type: string, cardId: string) => void;
    updateComponentStyle: (id: string, styleUpdates: Partial<ComponentItem['style']>) => void;
    appendComponents: (items: ComponentItem[]) => void;
    updateComponentParent: (id: string, parentId?: string) => void;
    removeComponent: (id: string) => void;
    duplicateComponent: (id: string) => void;
    updateComponentProp: (id: string, key: string, value: unknown) => void;
    replaceComponentProps: (id: string, props: Record<string, unknown>) => void;
    replaceCardChildren: (
      cardId: string,
      cardProps: Record<string, unknown>,
      children: ComponentItem[]
    ) => void;
    reorderComponent: (draggedId: string, targetId: string, position?: 'before' | 'after') => void;
    insertComponentAt: (type: string, targetId?: string | null, position?: 'before' | 'after') => void;
    moveComponent: (id: string, direction: 'up' | 'down') => void;
  }

/**
 * 剪贴板操作
 */
export interface ClipboardActions {
  copySelectedComponents: () => void;
  pasteClipboard: () => void;
}

/**
 * 选择相关操作
 */
export interface SelectionActions {
  setActiveComponentId: (id: string | null) => void;
  setSelectedComponentIds: (ids: string[]) => void;
  toggleSelectedComponentId: (id: string) => void;
  clearSelection: () => void;
  removeSelectedComponents: () => void;
}

/**
 * AI 相关操作
 */
export interface AIActions {
  appendAISessionEntry: (entry: Omit<AISessionEntry, 'timestamp'>) => void;
  clearAISessionLog: () => void;
}

/**
 * 其他操作
 */
export interface MiscActions {
  loadFromSnapshot: (payload: {
    canvasItems?: ComponentItem[];
    theme?: Partial<Theme>;
    layout?: Partial<Layout>;
  }) => void;
  clearCanvas: () => void;
  resetAll: () => void;
}

/**
 * 完整的 Forge Store 类型
 */
export type ForgeStore = ForgeStoreState &
  ThemeActions &
  LayoutActions &
  ComponentActions &
  ClipboardActions &
  HistoryActions &
  SelectionActions &
  AIActions &
  MiscActions;