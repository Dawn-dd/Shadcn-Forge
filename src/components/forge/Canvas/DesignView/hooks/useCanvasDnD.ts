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

  const handleItemDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
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