import React from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { getAlignClass } from './utils';
import { useCanvasDnD } from './hooks/useCanvasDnD';
import { useCanvasContextMenu } from './hooks/useCanvasContextMenu';
import { useCanvasNode } from './components/CanvasNode';
import { EmptyState } from './components/EmptyState';
import { ContextMenu } from './components/ContextMenu';

export const DesignView: React.FC = () => {
  const { layout, canvasItems, isPreviewMode } = useForgeStore();
  
  const dnd = useCanvasDnD();
  const contextMenu = useCanvasContextMenu();
  const { renderNodes } = useCanvasNode(dnd, contextMenu);

  const topLevelItems = canvasItems.filter(item => !item.parentId);

  return (
    <div
      onDragOver={dnd.handleCanvasDragOver}
      onDrop={dnd.handleCanvasDrop}
      onMouseDown={contextMenu.handleCanvasMouseDown}
      className={`w-full max-w-4xl mx-auto transition-colors duration-300 ${
        layout.direction === 'row' ? 'flex flex-row' : 'flex flex-col'
      } ${getAlignClass(layout.align)}`}
      style={{
        gap: `${layout.gap}px`,
        padding: `${layout.padding}px`,
        minHeight: '400px'
      }}
    >
      {canvasItems.length === 0 ? (
        <EmptyState />
      ) : (
        renderNodes(topLevelItems, layout.direction)
      )}

      {!isPreviewMode && contextMenu.contextMenu && (
        <ContextMenu 
          contextMenu={contextMenu.contextMenu} 
          onClose={contextMenu.closeContextMenu} 
        />
      )}
    </div>
  );
};