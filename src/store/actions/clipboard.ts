import { StateCreator } from 'zustand';
import { ForgeStore, ComponentItem } from '@/types';
import { generateId } from '@/lib/utils';
import { cloneComponentItem, filterTopLevelIds, collectNestedIds, getPasteInsertIndex } from '../helpers';

/**
 * 定义剪贴板操作接口
 */
export interface ClipboardActions {
  copySelectedComponents: () => void; // 复制选中组件
  pasteClipboard: () => void;         // 粘贴剪贴板内容
}

/**
 * 创建剪贴板操作的状态创建器
 * @param set Zustand的set函数，用于更新状态
 * @returns 返回剪贴板操作对象
 */
export const createClipboardActions: StateCreator<
  ForgeStore,
  [],
  [],
  ClipboardActions
> = (set) => ({
  // 复制选中组件
  copySelectedComponents: () =>
    set((state) => {
      // 确定要复制的源ID列表
      const sourceIds =
        state.selectedComponentIds.length > 0
          ? state.selectedComponentIds
          : state.activeComponentId
            ? [state.activeComponentId]
            : [];

      // 如果没有选中的组件，返回空状态
      if (sourceIds.length === 0) {
        return {}; // 返回空对象而不是 state
      }

      // 获取顶级ID和需要复制的嵌套ID
      const topLevelIds = filterTopLevelIds(state.canvasItems, sourceIds);
      const idsToCopy = collectNestedIds(state.canvasItems, topLevelIds);

      // 返回剪贴板项目，包含过滤和克隆后的组件
      return {
        clipboardItems: state.canvasItems
          .filter((item) => idsToCopy.has(item.id))
          .map((item) => cloneComponentItem(item))
      };
    }),

  // 粘贴剪贴板内容
  pasteClipboard: () =>
    set((state) => {
      // 如果剪贴板为空，返回空状态
      if (state.clipboardItems.length === 0) {
        return {}; // 返回空对象
      }

      // 创建ID映射和现有的ID集合
      const existingIds = new Set(state.canvasItems.map((item) => item.id));
      const idMap = new Map(state.clipboardItems.map((item) => [item.id, generateId()]));
      const pastedTopLevelIds: string[] = [];

      const pastedItems = state.clipboardItems.map((item) => { //  从剪贴板项目映射处理粘贴的组件项
        const remappedParentId = item.parentId
          ? idMap.get(item.parentId) ?? (existingIds.has(item.parentId) ? item.parentId : undefined)
          : undefined;

        const nextItem: ComponentItem = { //  创建新的组件项对象   复制原组件项的所有属性   使用idMap中的ID替换原ID   使用映射后的父级ID替换原父级ID
          ...cloneComponentItem(item),
          id: idMap.get(item.id)!,
          parentId: remappedParentId
        };

        if (!remappedParentId || !idMap.has(item.parentId ?? '')) { //  检查是否为顶级项   如果没有映射后的父级ID或原父级ID不在idMap中   则将该ID添加到顶级ID列表中
          pastedTopLevelIds.push(nextItem.id);
        }

        return nextItem;
      });

      const anchorIds = //  确定锚点ID 如果有选中的组件ID，则使用这些ID作为锚点
        state.selectedComponentIds.length > 0
          ? filterTopLevelIds(state.canvasItems, state.selectedComponentIds)
          : state.activeComponentId
            ? [state.activeComponentId]
            : [];

      const insertIndex = getPasteInsertIndex(state.canvasItems, anchorIds);
      const newItems = [...state.canvasItems];
      newItems.splice(insertIndex, 0, ...pastedItems);

      // 调用 _saveHistory 并展开结果
      const historyUpdate = state._saveHistory(newItems);

      return {
        ...historyUpdate,
        activeComponentId:
          pastedTopLevelIds[pastedTopLevelIds.length - 1] ??
          pastedItems[pastedItems.length - 1]?.id ??
          null,
        selectedComponentIds:
          pastedTopLevelIds.length > 0 ? pastedTopLevelIds : pastedItems.map((item) => item.id)
      };
    })
});