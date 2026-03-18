import { useState } from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { ContextMenuState } from '../utils';

export const useCanvasContextMenu = () => {
  const { isPreviewMode, selectedComponentIds, setSelectedComponentIds, setActiveComponentId, clearSelection } = useForgeStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    setContextMenu(null);
    const target = e.target as HTMLElement | null;
    let el = target;
    let insideItem = false;
    while (el && el !== e.currentTarget) {
      if (el.hasAttribute && el.hasAttribute('data-canvas-item')) {
        insideItem = true;
        break;
      }
      el = el.parentElement;
    }
    if (!insideItem) {
      clearSelection();
    }
  };

  const openContextMenu = (event: React.MouseEvent, itemId: string) => {
    if (isPreviewMode) return;
    event.preventDefault();
    event.stopPropagation();

    if (!selectedComponentIds.includes(itemId)) {
      setSelectedComponentIds([itemId]);
      setActiveComponentId(itemId);
    }

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      itemId
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  return {
    contextMenu,
    handleCanvasMouseDown,
    openContextMenu,
    closeContextMenu
  };
};