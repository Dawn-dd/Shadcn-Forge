/**
 * Forge Store - 使用 Zustand 创建的全局状态管理
 * 包含主题、布局、组件、剪贴板、历史记录、选择和AI功能的状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ForgeStore, PreviewViewport } from '@/types';
import { INITIAL_ITEMS, DEFAULT_THEME, DEFAULT_LAYOUT } from './constants';
import { createThemeActions } from './actions/theme';
import { createLayoutActions } from './actions/layout';
import { createComponentActions } from './actions/component';
import { createClipboardActions } from './actions/clipboard';
import { createHistoryActions } from './actions/history';
import { createSelectionActions } from './actions/selection';
import { createAIActions } from './actions/ai';

// 创建持久化的 Forge Store
export const useForgeStore = create<ForgeStore>()(
  persist(
    (set, get) => ({

      isDarkMode: false,           // 深色模式状态
      theme: DEFAULT_THEME,        // 主题配置
      layout: DEFAULT_LAYOUT,      // 布局配置
      canvasItems: INITIAL_ITEMS,  // 画布初始项目
      clipboardItems: [],          // 剪贴板项目
      activeComponentId: null,     // 当前激活的组件ID
      selectedComponentIds: [],    // 选中的组件ID列表
      isPreviewMode: false,        // 是否处于预览模式
      previewViewport: 'desktop' as PreviewViewport,  // 预览视口类型
      history: [INITIAL_ITEMS],    // 历史记录
      historyStep: 0,             // 当前历史步骤
      aiSessionLog: [],           // AI会话日志

      // Actions
      ...createThemeActions(set, get, {} as never),
      ...createLayoutActions(set, get, {} as never),
      ...createComponentActions(set, get, {} as never),
      ...createClipboardActions(set, get, {} as never),
      ...createHistoryActions(set, get, {} as never),
      ...createSelectionActions(set, get, {} as never),
      ...createAIActions(set, get, {} as never),

      // 其他操作
/**
 * 从快照加载数据的方法
 * @param {Object} payload - 包含要恢复的数据的对象
 * @returns {Function} - 一个设置状态的函数，用于更新store状态
 */
      loadFromSnapshot: (payload) =>
        set((state) => {
          const restoredItems = Array.isArray(payload.canvasItems) ? payload.canvasItems : [];

          return {
            canvasItems: restoredItems,
            history: [JSON.parse(JSON.stringify(restoredItems))],
            historyStep: 0,
            activeComponentId: null,
            selectedComponentIds: [],
            theme: payload.theme ? { ...state.theme, ...payload.theme } : state.theme,
            layout: payload.layout ? { ...state.layout, ...payload.layout } : state.layout
          };
        }),

/**
 * 清除画布内容的方法
 * @returns {Function} - 一个设置状态的函数，用于更新store状态
 */
      clearCanvas: () =>
        set((state) => ({
          ...state._saveHistory([]),
          activeComponentId: null,
          selectedComponentIds: []
        })),

/**
 * 重置所有状态到初始值的方法
 * @returns {Function} - 一个设置状态的函数，用于重置store状态
 */
      resetAll: () =>
        set({
          theme: DEFAULT_THEME,
          layout: DEFAULT_LAYOUT,
          canvasItems: INITIAL_ITEMS,
          clipboardItems: [],
          history: [INITIAL_ITEMS],
          historyStep: 0,
          aiSessionLog: [],
          activeComponentId: null,
          selectedComponentIds: [],
          isPreviewMode: false,
          isDarkMode: false
        })
    }),
    {

  // 持久化存储的配置
      name: 'forge-store',
      partialize: (state) => ({
    // 指定需要持久化的状态字段
        isDarkMode: state.isDarkMode,
        theme: state.theme,
        layout: state.layout,
        canvasItems: state.canvasItems,
        aiSessionLog: state.aiSessionLog
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ForgeStore>;
        const restoredCanvasItems = persisted.canvasItems ?? currentState.canvasItems;

        return {
      // 合并当前状态和持久化状态
          ...currentState,
          ...persisted,
          canvasItems: restoredCanvasItems,
          clipboardItems: [],
          history: [JSON.parse(JSON.stringify(restoredCanvasItems))],
          historyStep: 0,
          activeComponentId: null,
          selectedComponentIds: [],
          isPreviewMode: false,
          previewViewport: 'desktop' as PreviewViewport
        } as ForgeStore;
      }
    }
  )
);