/**
 * DesignView 组件 - 设计视图的主组件
 * 负责渲染画布、处理拖放操作、上下文菜单以及节点渲染
 */
import React from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { getAlignClass } from './utils';
import { useCanvasDnD } from './hooks/useCanvasDnD';
import { useCanvasContextMenu } from './hooks/useCanvasContextMenu';
import { useCanvasNode } from './hooks/useCanvasNode';
import { EmptyState } from './components/EmptyState';
import { ContextMenu } from './components/ContextMenu';

export const DesignView: React.FC = () => {
  const { layout, canvasItems, isPreviewMode } = useForgeStore();
  
  const dnd = useCanvasDnD();
  const contextMenu = useCanvasContextMenu();
  const { renderNodes } = useCanvasNode(dnd, contextMenu);

  // 获取顶层画布项（没有父项的项）
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
      {/* 如果画布为空，显示空状态；否则渲染节点 */}
      {canvasItems.length === 0 ? (
        <EmptyState />
      ) : (
        renderNodes(topLevelItems, layout.direction)
      )}

      {/* 如果不在预览模式且上下文菜单存在，显示上下文菜单 */}
      {!isPreviewMode && contextMenu.contextMenu && (
        <ContextMenu 
          contextMenu={contextMenu.contextMenu} 
          onClose={contextMenu.closeContextMenu} 
        />
      )}
    </div>
  );
};