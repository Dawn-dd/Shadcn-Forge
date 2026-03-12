import React from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { Trash2, Copy, GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { Theme, Layout } from '@/types';

export const DesignView: React.FC = () => {
  const {
    canvasItems,
    activeComponentId,
    setActiveComponentId,
    removeComponent,
    duplicateComponent,
    moveComponent,
    reorderComponent,
    theme,
    layout,
    isPreviewMode
  } = useForgeStore();

  // Internal drag handlers for reordering
  const handleItemDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    // set both a custom type and text/plain for broader compatibility
    e.dataTransfer.setData('forge-drag-id', id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setActiveComponentId(id);
  };

  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDrop = (e: React.DragEvent, targetId: string) => {
    e.stopPropagation();
    e.preventDefault();
    // try both keys (custom and text/plain)
    const draggedId = e.dataTransfer.getData('forge-drag-id') || e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== targetId) {
      reorderComponent(draggedId, targetId);
    }
  };

  const handleItemDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // canvas-level drag handlers (添加侧边栏组件到画布)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('forge-type');
    if (type) {
      useForgeStore.getState().addComponent(type);
    }
  };

  // 计算对齐方式
  const getAlignClass = () => {
    switch (layout.align) {
      case 'start':
        return 'items-start';
      case 'center':
        return 'items-center';
      case 'end':
        return 'items-end';
      default:
        return 'items-center';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
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
      setActiveComponentId(null);
    }
  };

  // Render nodes with grouping: contiguous items with direction 'row' are wrapped into a single flex-row container
  const renderNodes = () => {
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < canvasItems.length; i++) {
      const item = canvasItems[i];
      const itemDir = (item.style?.direction as Layout['direction']) ?? layout.direction;

      if (itemDir === 'row') {
        // collect group
        const group: typeof canvasItems = [item];
        let j = i + 1;
        while (j < canvasItems.length && ((canvasItems[j].style?.direction as Layout['direction']) ?? layout.direction) === 'row') {
          group.push(canvasItems[j]);
          j++;
        }

        nodes.push(
          <div key={`group-${i}-${group.map(g=>g.id).join('-')}`} className="flex w-full" style={{ gap: `${layout.gap}px` }}>
            {group.map((gi) => {
              const config = COMPONENT_REGISTRY[gi.type];
              if (!config) return null;

              const isActive = activeComponentId === gi.id;
              const componentTheme: Theme = {
                ...theme,
                background: gi.style?.backgroundColor ?? theme.background,
                foreground: gi.style?.color ?? theme.foreground,
                border: gi.style?.borderColor ?? theme.border,
                radius: gi.style?.borderRadius ?? theme.radius,
                borderWidth: gi.style?.borderWidth ?? theme.borderWidth
              };

              const itemLayout = { ...layout, direction: (gi.style?.direction as Layout['direction']) ?? 'row' };

              return (
                <div
                  key={gi.id}
                  data-canvas-item={gi.id}
                  draggable={!isPreviewMode}
                  onDragStart={(e) => handleItemDragStart(e, gi.id)}
                  onDragOver={handleItemDragOver}
                  onDrop={(e) => handleItemDrop(e, gi.id)}
                  onDragEnd={handleItemDragEnd}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (!isPreviewMode) setActiveComponentId(gi.id);
                  }}
                  className={`relative group transition-colors flex-shrink-0`}
                  style={{
                    outline: isActive && !isPreviewMode ? `2px solid ${theme.primary}` : 'none',
                    outlineOffset: '4px',
                    borderRadius: `${componentTheme.radius}px`,
                    boxSizing: 'border-box',
                    width: gi.style?.width === 'full' ? '100%' : undefined
                  }}
                >
                  {config.render(gi.props, componentTheme, itemLayout, gi)}

                  {!isPreviewMode && isActive && (
                    <div
                      className="absolute -top-10 left-0 flex items-center gap-1 px-2 py-1 rounded-lg shadow-lg z-10"
                      style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
                    >
                      {/* control buttons (reuse existing handlers) */}
                      <button onClick={(e)=>{e.stopPropagation(); moveComponent(gi.id,'up');}} disabled={false} className="p-1.5 rounded"> <MoveUp size={14} /> </button>
                      <button onClick={(e)=>{e.stopPropagation(); moveComponent(gi.id,'down');}} disabled={false} className="p-1.5 rounded"> <MoveDown size={14} /> </button>
                      <div className="w-px h-4 mx-1" style={{ backgroundColor: theme.border }} />
                      <button onClick={(e)=>{e.stopPropagation(); duplicateComponent(gi.id);}} className="p-1.5 rounded"> <Copy size={14} /> </button>
                      <button onClick={(e)=>{e.stopPropagation(); removeComponent(gi.id);}} className="p-1.5 rounded"> <Trash2 size={14} /> </button>
                      <div className="cursor-move p-1.5" style={{ color: theme.mutedForeground }}><GripVertical size={14} /></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

        i = j - 1; // advance
      } else {
        // single item (column or default)
        const config = COMPONENT_REGISTRY[item.type];
        if (!config) continue;

        const isActive = activeComponentId === item.id;
        const componentTheme: Theme = {
          ...theme,
          background: item.style?.backgroundColor ?? theme.background,
          foreground: item.style?.color ?? theme.foreground,
          border: item.style?.borderColor ?? theme.border,
          radius: item.style?.borderRadius ?? theme.radius,
          borderWidth: item.style?.borderWidth ?? theme.borderWidth
        };

        const itemLayout = { ...layout, direction: (item.style?.direction as Layout['direction']) ?? 'column' };

        nodes.push(
          <div
            key={item.id}
            data-canvas-item={item.id}
            draggable={!isPreviewMode}
            onDragStart={(e) => handleItemDragStart(e, item.id)}
            onDragOver={handleItemDragOver}
            onDrop={(e) => handleItemDrop(e, item.id)}
            onDragEnd={handleItemDragEnd}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (!isPreviewMode) setActiveComponentId(item.id);
            }}
            className={`relative group transition-colors ${itemLayout.direction === 'row' ? 'flex-shrink-0' : 'w-full'}`}
            style={{
              outline: isActive && !isPreviewMode ? `2px solid ${theme.primary}` : 'none',
              outlineOffset: '4px',
              borderRadius: `${componentTheme.radius}px`
            }}
          >
            {config.render(item.props, componentTheme, itemLayout, item)}

            {!isPreviewMode && isActive && (
              <div
                className="absolute -top-10 left-0 flex items-center gap-1 px-2 py-1 rounded-lg shadow-lg z-10"
                style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
              >
                <button onClick={(e)=>{e.stopPropagation(); moveComponent(item.id,'up');}} disabled={false} className="p-1.5 rounded"> <MoveUp size={14} /> </button>
                <button onClick={(e)=>{e.stopPropagation(); moveComponent(item.id,'down');}} disabled={false} className="p-1.5 rounded"> <MoveDown size={14} /> </button>
                <div className="w-px h-4 mx-1" style={{ backgroundColor: theme.border }} />
                <button onClick={(e)=>{e.stopPropagation(); duplicateComponent(item.id);}} className="p-1.5 rounded"> <Copy size={14} /> </button>
                <button onClick={(e)=>{e.stopPropagation(); removeComponent(item.id);}} className="p-1.5 rounded"> <Trash2 size={14} /> </button>
                <div className="cursor-move p-1.5" style={{ color: theme.mutedForeground }}><GripVertical size={14} /></div>
              </div>
            )}
          </div>
        );
      }
    }
    return nodes;
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      className={`w-full max-w-4xl mx-auto transition-colors duration-300 ${
        layout.direction === 'row' ? 'flex flex-row' : 'flex flex-col'
      } ${getAlignClass()}`}
      style={{
        gap: `${layout.gap}px`,
        padding: `${layout.padding}px`,
        minHeight: '400px'
      }}
    >
      {canvasItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl transition-colors"
          style={{ 
            borderColor: theme.border,
            color: theme.mutedForeground 
          }}
        >
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">拖拽组件到这里开始设计</p>
            <p className="text-xs opacity-60">或点击组件箱中的组件添加</p>
          </div>
        </div>
      ) : (
        renderNodes()
      )}
    </div>
  );
};