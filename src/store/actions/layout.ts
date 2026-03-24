/**
 * 导入StateCreator类型，用于创建状态管理器
 * 导入ForgeStore和PreviewViewport类型定义
 */
import { StateCreator } from 'zustand';
import { ForgeStore, PreviewViewport } from '@/types';

/**
 * 定义布局相关的操作接口
 * 包含更新布局、切换预览模式和设置预览视口三个方法
 */
export interface LayoutActions {
  updateLayout: (updates: Partial<ForgeStore['layout']>) => void;  // 更新布局状态的方法
  togglePreviewMode: () => void;  // 切换预览模式的方法
  setPreviewViewport: (viewport: PreviewViewport) => void;  // 设置预览视口的方法
}

/**
 * 创建布局状态管理器的函数
 * 使用StateCreator类型定义，用于ForgeStore的状态管理
 */
export const createLayoutActions: StateCreator<
  ForgeStore,
  [],
  [],
  LayoutActions
> = (set) => ({
  /**
   * 更新布局状态的方法
   * @param updates - 部分的布局状态更新对象
   */
  updateLayout: (updates) =>
    set((state) => ({
      layout: { ...state.layout, ...updates }  // 合并新旧布局状态
    })),

  /**
   * 切换预览模式的方法
   * 切换预览模式状态，并清除活动组件和选中组件
   */
  togglePreviewMode: () =>
    set((state) => ({
      isPreviewMode: !state.isPreviewMode,  // 切换预览模式状态
      activeComponentId: null,  // 清除活动组件ID
      selectedComponentIds: []  // 清除选中组件ID列表
    })),



  /**
   * 设置预览视口的方法
   * @param viewport - 预览视口配置对象
   */
  setPreviewViewport: (viewport) => set({ previewViewport: viewport })
});  // 设置预览视口状态