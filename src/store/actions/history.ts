import { StateCreator } from 'zustand';
import { ForgeStore, ComponentItem } from '@/types';

/**
 * 历史记录操作接口
 * 定义了与历史记录相关的操作方法
 */
export interface HistoryActions {
  /**
   * 保存历史记录
   * @param newItems - 当前画布上的组件数组
   * @returns 返回包含当前画布项目、历史记录数组和历史记录步数的对象
   */
  _saveHistory: (newItems: ComponentItem[]) => {
    canvasItems: ComponentItem[];
    history: ComponentItem[][];
    historyStep: number;
  };
  /**
   * 撤销操作
   * 将画布内容回退到上一步的历史记录
   */
  undo: () => void;
  /**
   * 重做操作
   * 将画布内容前进到下一步的历史记录
   */
  redo: () => void;
}

/**
 * 创建历史记录相关的状态操作
 * 使用 Zustand 的 StateCreator 创建历史记录管理的状态更新函数
 */
export const createHistoryActions: StateCreator<
  ForgeStore,
  [],
  [],
  HistoryActions
> = (set, get) => ({
  // 明确返回对象，不使用 Partial
  _saveHistory: (newItems) => {
    const { history, historyStep } = get();
    // 创建新的历史记录数组，截取到当前步骤，避免重做后新增历史记录导致混乱
    const newHistory = history.slice(0, historyStep + 1);
    // 深拷贝当前组件状态并添加到历史记录中
    newHistory.push(JSON.parse(JSON.stringify(newItems)));
    
    return {
      canvasItems: newItems,
      history: newHistory,
      historyStep: newHistory.length - 1
    };
  },

  // 撤销操作：回退到上一步历史记录
  undo: () =>
    set((state) => {
      // 确保不是第一步，避免越界
      if (state.historyStep > 0) {
        return {
          historyStep: state.historyStep - 1,
          canvasItems: state.history[state.historyStep - 1],
          // 撤销时清除组件的激活和选中状态
          activeComponentId: null,
          selectedComponentIds: []
        };
      }
      return {};
    }),

  // 重做操作：前进到下一步历史记录
  redo: () =>
    set((state) => {
      // 确保不是最后一步，避免越界
      if (state.historyStep < state.history.length - 1) {
        return {
          historyStep: state.historyStep + 1,
          canvasItems: state.history[state.historyStep + 1],
          // 重做时清除组件的激活和选中状态
          activeComponentId: null,
          selectedComponentIds: []
        };
      }
      return {};
    })
});