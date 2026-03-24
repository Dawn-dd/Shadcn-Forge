import { StateCreator } from 'zustand';
import { ForgeStore } from '@/types';
// import { collectDescendantIds } from '../helpers';

/**
 * 定义选择操作相关的接口
 * 包含设置活动组件ID、设置选中组件ID列表、切换组件选中状态、清除选择和删除选中组件的方法
 */
export interface SelectionActions {
  setActiveComponentId: (id: string | null) => void;
  setSelectedComponentIds: (ids: string[]) => void;
  toggleSelectedComponentId: (id: string) => void; 
  clearSelection: () => void;
  removeSelectedComponents: () => void;
}

/**
 * 创建选择操作的状态创建器
 * 使用Zustand的StateCreator创建选择相关的状态操作方法
 */
export const createSelectionActions: StateCreator<
  ForgeStore,
  [],
  [],
  SelectionActions
> = (set) => ({
  /**
   * 设置活动组件ID，并更新选中列表
   * 如果传入的id不为null，则选中列表只包含该id
   * 如果传入的id为null，则清空选中列表
   */
  setActiveComponentId: (id) =>
    set({
      activeComponentId: id,
      selectedComponentIds: id ? [id] : []
    }),

/**
 * 设置选中的组件ID，并更新活动组件ID
 * 如果有选中的组件，则最后一个被选中的组件作为活动组件
 * @param {Array} ids - 要设置的组件ID数组
 */
  setSelectedComponentIds: (ids) =>
    set((state) => ({
      selectedComponentIds: ids,
      activeComponentId:
        ids.length > 0
          ? state.activeComponentId && ids.includes(state.activeComponentId)
            ? state.activeComponentId
            : ids[ids.length - 1]
          : null
    })),

/**
 * 切换组件选中状态的函数
 * @param {string | number} id - 要切换选中状态的组件ID
 * @returns {void} - 无返回值，通过set函数更新状态
 */
  toggleSelectedComponentId: (id) =>
    set((state) => {
      const exists = state.selectedComponentIds.includes(id);
      const nextIds = exists
        ? state.selectedComponentIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedComponentIds, id];

      return {
        selectedComponentIds: nextIds,
        activeComponentId: nextIds.length > 0 ? (exists ? nextIds[nextIds.length - 1] : id) : null
      };
    }),

  /**
   * 清除所有选择
   */
  clearSelection: () => set({ activeComponentId: null, selectedComponentIds: [] }),

/**
 * 移除选中组件的函数
 * 这个函数会递归查找并移除所有选中的组件及其子组件
 * @returns {void} 无返回值，通过set更新状态
 */
  removeSelectedComponents: () =>
    set((state) => {
      const selectedIds = state.selectedComponentIds;
      if (selectedIds.length === 0) return {};

      const descendantIds = new Set<string>();
    // 初始化队列，将选中的组件ID放入队列中
      const queue = [...selectedIds];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        descendantIds.add(currentId);

        state.canvasItems.forEach((item) => {
          if (item.parentId === currentId && !descendantIds.has(item.id)) {
            queue.push(item.id);
          }
        });
      }

      const newItems = state.canvasItems.filter((item) => !descendantIds.has(item.id));

      const historyUpdate = state._saveHistory(newItems);
      
      return {
        ...historyUpdate,
        activeComponentId: null,
        selectedComponentIds: []
      };
    })
});