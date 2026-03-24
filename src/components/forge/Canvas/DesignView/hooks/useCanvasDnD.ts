/**
 * 自定义Hook，用于处理画布上的拖拽功能
 * 提供了组件拖拽、放置、排序等相关功能
 */
import { useState } from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { Layout } from '@/types';
import { DropPosition } from '../utils';

export const useCanvasDnD = () => {
  const {
    canvasItems,
    setActiveComponentId,
    addComponentToCard,
    insertComponentAt,
    updateComponentParent,
    reorderComponent,
    addComponent
  } = useForgeStore();

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>('before');

  /** * 处理拖拽开始事件的函数 * 启动拖拽操作，将当前拖拽项的 ID 传递给后续的 drop（放置）事件处理程序，并更新应用状态以反映拖拽开始。 */
  const handleItemDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('forge-drag-id', id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setActiveComponentId(id);
  };

  const handleItemDragOver = (e: React.DragEvent, id: string, direction: Layout['direction']) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const nextPosition = direction === 'row'
      ? (e.clientX < rect.left + rect.width / 2 ? 'before' : 'after')
      : (e.clientY < rect.top + rect.height / 2 ? 'before' : 'after');

    setDragOverId(id);
    setDropPosition(nextPosition);
  };

  /** * 处理项目拖放事件的函数 * 实时检测拖拽元素悬停在哪个目标元素上，并精确判断用户意图是将其放在目标的前面还是后面，从而实现精确的排序或插入功能。 */
  const handleItemDrop = (e: React.DragEvent, targetId: string) => { 
    e.stopPropagation();
    e.preventDefault();

    const plainData = e.dataTransfer.getData('text/plain');
    const fallbackType = plainData.startsWith('forge-type:') ? plainData.replace('forge-type:', '') : '';
    const componentType = e.dataTransfer.getData('forge-type') || fallbackType;
    const draggedIdRaw = e.dataTransfer.getData('forge-drag-id') || plainData;
    const draggedId = draggedIdRaw.startsWith('forge-type:') ? '' : draggedIdRaw;

    const targetItem = canvasItems.find((item) => item.id === targetId);
    const targetCardId = targetItem?.type === 'Card' ? targetItem.id : targetItem?.parentId;

    if (componentType) {
      if (targetCardId) {
        addComponentToCard(componentType, targetCardId);
      } else {
        insertComponentAt(componentType, targetId, dropPosition);
      }
    } else if (draggedId && draggedId !== targetId) {
      if (targetCardId && draggedId !== targetCardId) {
        updateComponentParent(draggedId, targetCardId);
      } else if (!targetCardId) {
        updateComponentParent(draggedId, undefined);
      }
      reorderComponent(draggedId, targetId, dropPosition);
    }
    setDragOverId(null);
  };

  const handleItemDragEnd = (e: React.DragEvent) => { //  处理拖拽结束事件的函数
    e.preventDefault();
    setDragOverId(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => { //  处理画布拖拽悬停事件的函数
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => { //  处理画布放置事件的函数
    e.preventDefault();
    const plainData = e.dataTransfer.getData('text/plain');
    const fallbackType = plainData.startsWith('forge-type:') ? plainData.replace('forge-type:', '') : '';
    const type = e.dataTransfer.getData('forge-type') || fallbackType;
    const draggedIdRaw = e.dataTransfer.getData('forge-drag-id') || plainData;
    const draggedId = draggedIdRaw.startsWith('forge-type:') ? '' : draggedIdRaw;
    
    if (type) {
      addComponent(type);
    } else if (draggedId) {
      updateComponentParent(draggedId, undefined);
    }
    setDragOverId(null);
  };

  return {
    dragOverId, setDragOverId,
    dropPosition,
    handleItemDragStart, handleItemDragOver, handleItemDrop, handleItemDragEnd,
    handleCanvasDragOver, handleCanvasDrop
  };
};