/**
 * 组件操作相关的类型定义和状态创建器
 * 包含添加、更新、删除、复制、排序等多种组件操作方法
 */
import { StateCreator } from 'zustand';
import { ForgeStore, ComponentItem } from '@/types';
import { COMPONENT_REGISTRY } from '@/config/components';
import { generateId } from '@/lib/utils';
import { collectDescendantIds } from '../helpers';

// 定义组件操作接口，包含所有组件操作的方法签名
export interface ComponentActions {
  addComponent: (type: string) => void; // 添加新组件到画布
  addComponentToCard: (type: string, cardId: string) => void; // 添加组件到指定卡片
  updateComponentStyle: (id: string, styleUpdates: Partial<ComponentItem['style']>) => void; // 更新组件样式
  appendComponents: (items: ComponentItem[]) => void; // 批量添加组件
  updateComponentParent: (id: string, parentId?: string) => void; // 更新组件的父组件
  removeComponent: (id: string) => void; // 删除组件及其子组件
  duplicateComponent: (id: string) => void; // 复制组件
  updateComponentProp: (id: string, key: string, value: unknown) => void; // 更新组件属性
  replaceComponentProps: (id: string, props: Record<string, unknown>) => void; // 替换组件属性
  replaceCardChildren: (cardId: string, cardProps: Record<string, unknown>, children: ComponentItem[]) => void; // 替换卡片子组件
  reorderComponent: (draggedId: string, targetId: string, position?: 'before' | 'after') => void; // 重新排序组件
  insertComponentAt: (type: string, targetId?: string | null, position?: 'before' | 'after') => void; // 在指定位置插入组件
  moveComponent: (id: string, direction: 'up' | 'down') => void; // 上移或下移组件
}

/**
 * 创建组件操作的状态创建器
 * 实现所有组件操作的具体逻辑
 */
export const createComponentActions: StateCreator<
  ForgeStore,
  [],
  [],
  ComponentActions
> = (set) => ({
  // 添加新组件到画布
  // 创建新组件实例并添加到画布末尾，同时设置为活动组件
  addComponent: (type) =>
    set((state) => {
      // 创建新组件对象
      const newItem: ComponentItem = {
        id: generateId(), // 生成唯一ID
        type,
        props: structuredClone(COMPONENT_REGISTRY[type].defaultProps) // 深拷贝默认属性
      };
      // 将新组件添加到画布
      const newItems = [...state.canvasItems, newItem];
      
      const historyUpdate = state._saveHistory(newItems);
      
      return {
        ...historyUpdate,
        activeComponentId: newItem.id,
        selectedComponentIds: [newItem.id]
      };
    }),

  // 添加组件到指定卡片
  addComponentToCard: (type, cardId) =>
    set((state) => {
      const cardExists = state.canvasItems.some((item) => item.id === cardId && item.type === 'Card');
      if (!cardExists) return {};

      const newItem: ComponentItem = {
        id: generateId(),
        type,
        parentId: cardId,
        props: structuredClone(COMPONENT_REGISTRY[type].defaultProps)
      };

      const items = [...state.canvasItems];
      const cardIndex = items.findIndex((item) => item.id === cardId);
      let insertIndex = cardIndex + 1;

      // 找到正确的插入位置，确保组件添加到卡片内部
      while (insertIndex < items.length && items[insertIndex].parentId === cardId) {
        insertIndex += 1;
      }

      items.splice(insertIndex, 0, newItem);

      const historyUpdate = state._saveHistory(items);
      
      return {
        ...historyUpdate,
        activeComponentId: newItem.id,
        selectedComponentIds: [newItem.id]
      };
    }),

  // 更新组件样式
  updateComponentStyle: (id, styleUpdates) =>
    set((state) => {
      const newItems = state.canvasItems.map((item) =>
        item.id === id
          ? { ...item, style: { ...item.style, ...styleUpdates } }
          : item
      );
      return state._saveHistory(newItems);
    }),

  // 批量添加组件
  appendComponents: (items) =>
    set((state) => {
      const newItems = [...state.canvasItems, ...items];
      return state._saveHistory(newItems);
    }),

  // 更新组件的父组件
  updateComponentParent: (id, parentId) =>
    set((state) => {
      if (id === parentId) return {};

      const newItems = state.canvasItems.map((item) =>
        item.id === id ? { ...item, parentId } : item
      );

      return state._saveHistory(newItems);
    }),

  // 删除组件及其子组件
  removeComponent: (id) =>
    set((state) => {
      const descendantIds = collectDescendantIds(state.canvasItems, id);
      const newItems = state.canvasItems.filter((item) => !descendantIds.has(item.id));

      const historyUpdate = state._saveHistory(newItems);
      
      return {
        ...historyUpdate,
        activeComponentId:
          state.activeComponentId && descendantIds.has(state.activeComponentId)
            ? null
            : state.activeComponentId,
        selectedComponentIds: state.selectedComponentIds.filter(
          (selectedId) => !descendantIds.has(selectedId)
        )
      };
    }),

  // 复制组件
  duplicateComponent: (id) =>
    set((state) => {
      const itemToCopy = state.canvasItems.find((i) => i.id === id);
      if (!itemToCopy) return {};

      const newItem: ComponentItem = {
        ...itemToCopy,
        id: generateId(),
        props: structuredClone(itemToCopy.props),
        style: itemToCopy.style ? structuredClone(itemToCopy.style) : undefined
      };

      const newItems = [...state.canvasItems];
      const index = state.canvasItems.findIndex((i) => i.id === id);
      newItems.splice(index + 1, 0, newItem);

      const historyUpdate = state._saveHistory(newItems);
      
      return {
        ...historyUpdate,
        activeComponentId: newItem.id,
        selectedComponentIds: [newItem.id]
      };
    }),

  // 更新组件属性
  updateComponentProp: (id, key, value) =>
    set((state) => {
      const newItems = state.canvasItems.map((item) =>
        item.id === id ? { ...item, props: { ...item.props, [key]: value } } : item
      );
      return state._saveHistory(newItems);
    }),

  // 替换组件属性
  replaceComponentProps: (id, props) =>
    set((state) => {
      const newItems = state.canvasItems.map((item) =>
        item.id === id ? { ...item, props: structuredClone(props) } : item
      );
      return state._saveHistory(newItems);
    }),

  // 替换卡片子组件
  replaceCardChildren: (cardId, cardProps, children) =>
    set((state) => {
      const cardIndex = state.canvasItems.findIndex(
        (item) => item.id === cardId && item.type === 'Card'
      );
      if (cardIndex === -1) return {};

      const descendantIds = collectDescendantIds(state.canvasItems, cardId);
      descendantIds.delete(cardId);

      const nextChildren = children.map((child) => ({
        ...child,
        parentId: cardId
      }));

      const retainedItems = state.canvasItems
        .filter((item) => !descendantIds.has(item.id))
        .map((item) =>
          item.id === cardId ? { ...item, props: structuredClone(cardProps) } : item
        );

      const retainedCardIndex = retainedItems.findIndex((item) => item.id === cardId);
      retainedItems.splice(retainedCardIndex + 1, 0, ...nextChildren);

      const historyUpdate = state._saveHistory(retainedItems);
      
      return {
        ...historyUpdate,
        activeComponentId: cardId,
        selectedComponentIds: [cardId]
      };
    }),

  // 重新排序组件
  reorderComponent: (draggedId, targetId, position = 'before') =>
    set((state) => {
      if (draggedId === targetId) return {};

      const items = [...state.canvasItems];
      const oldIndex = items.findIndex((i) => i.id === draggedId);
      if (oldIndex === -1) return {};

      const [movedItem] = items.splice(oldIndex, 1);
      const newIndex = items.findIndex((i) => i.id === targetId);

      if (newIndex === -1) {
        items.push(movedItem);
      } else {
        items.splice(position === 'after' ? newIndex + 1 : newIndex, 0, movedItem);
      }

      return state._saveHistory(items);
    }),

  // 在组件中插入
  insertComponentAt: (type, targetId = null, position = 'before') =>
    set((state) => {
      const newItem: ComponentItem = {
        id: generateId(),
        type,
        props: structuredClone(COMPONENT_REGISTRY[type].defaultProps)
      };

      const items = [...state.canvasItems];
      
      // 处理 null 和 undefined
      if (targetId) {
        const index = items.findIndex((i) => i.id === targetId);
        if (index !== -1) {
          items.splice(position === 'after' ? index + 1 : index, 0, newItem);
        } else {
          items.push(newItem);
        }
      } else {
        items.push(newItem);
      }

      const historyUpdate = state._saveHistory(items);
      
      return {
        ...historyUpdate,
        activeComponentId: newItem.id,
        selectedComponentIds: [newItem.id]
      }; 
    }),

  // 移动组件
  moveComponent: (id, direction) =>
    set((state) => {
      const items = [...state.canvasItems];
      const index = items.findIndex((i) => i.id === id);
      if (index === -1) return {};

      if (direction === 'up' && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === 'down' && index < items.length - 1) {
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
      } else {
        return {};
      }

      return state._saveHistory(items);
    })
});