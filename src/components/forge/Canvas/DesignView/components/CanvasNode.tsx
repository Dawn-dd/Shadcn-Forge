import React from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { Theme, Layout, ComponentItem } from '@/types';
import { getItemFrameStyle } from '../utils';
import { ActiveToolbar } from './ActiveToolbar';

interface DndHandlers {
  handleItemDragStart: (e: React.DragEvent, id: string) => void;
  handleItemDragOver: (e: React.DragEvent, id: string, direction: Layout['direction']) => void;
  handleItemDrop: (e: React.DragEvent, id: string) => void;
  handleItemDragEnd: (e: React.DragEvent) => void;
  setDragOverId: (callback: (prev: string | null) => string | null) => void;
  dragOverId: string | null;
  dropPosition: 'before' | 'after';
}

interface ContextMenuHandlers {
  openContextMenu: (event: React.MouseEvent, id: string) => void;
}

export const useCanvasNode = (dnd: DndHandlers, contextMenu: ContextMenuHandlers) => {
  const store = useForgeStore();
  const getCardChildren = (cardId: string) => store.canvasItems.filter((item) => item.parentId === cardId);

  const renderNodes = (items: ComponentItem[], containerDirection: Layout['direction']): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemDir = (item.style?.direction as Layout['direction']) ?? containerDirection;

      if (itemDir === 'row') {
        const group: ComponentItem[] = [item];
        let j = i + 1;
        while (j < items.length && ((items[j].style?.direction as Layout['direction']) ?? containerDirection) === 'row') {
          group.push(items[j]);
          j++;
        }

        nodes.push(
          <div key={`group-${i}-${group.map(g => g.id).join('-')}`} className="flex w-full" style={{ gap: `${store.layout.gap}px` }}>
            {group.map((gi) => {
              const config = COMPONENT_REGISTRY[gi.type];
              if (!config) return null;

              const isSelected = store.selectedComponentIds.includes(gi.id);
              const isActive = store.activeComponentId === gi.id;
              const componentTheme: Theme = {
                ...store.theme,
                background: gi.style?.backgroundColor ?? store.theme.background,
                foreground: gi.style?.color ?? store.theme.foreground,
                border: gi.style?.borderColor ?? store.theme.border,
                radius: gi.style?.borderRadius ?? store.theme.radius,
                borderWidth: gi.style?.borderWidth ?? store.theme.borderWidth
              };

              const itemLayout = { ...store.layout, direction: (gi.style?.direction as Layout['direction']) ?? 'row' };
              const childNodes = gi.type === 'Card' ? renderNodes(getCardChildren(gi.id), gi.style?.childrenDirection ?? 'column') : [];

              return (
                <div
                  key={gi.id}
                  data-canvas-item={gi.id}
                  draggable={!store.isPreviewMode}
                  onDragStart={(e) => dnd.handleItemDragStart(e, gi.id)}
                  onDragOver={(e) => dnd.handleItemDragOver(e, gi.id, itemLayout.direction)}
                  onDrop={(e) => dnd.handleItemDrop(e, gi.id)}
                  onDragEnd={dnd.handleItemDragEnd}
                  onDragLeave={() => dnd.setDragOverId((prev: string | null) => (prev === gi.id ? null : prev))}
                  onContextMenu={(event) => contextMenu.openContextMenu(event, gi.id)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (!store.isPreviewMode) {
                      if (e.shiftKey) store.toggleSelectedComponentId(gi.id);
                      else { store.setSelectedComponentIds([gi.id]); store.setActiveComponentId(gi.id); }
                    }
                  }}
                  className="relative group transition-colors flex-shrink-0"
                  style={{
                    outline: (isSelected || isActive) && !store.isPreviewMode ? `2px solid ${store.theme.primary}` : 'none',
                    outlineOffset: '4px',
                    borderRadius: `${componentTheme.radius}px`,
                    boxSizing: 'border-box',
                    ...getItemFrameStyle(gi, itemLayout)
                  }}
                >
                  {!store.isPreviewMode && dnd.dragOverId === gi.id && (
                    <div className="absolute inset-x-0 z-40 h-0.5 bg-indigo-500" style={dnd.dropPosition === 'before' ? { top: '-6px' } : { bottom: '-6px' }} />
                  )}

                  {config.render(
                    gi.type === 'Card'
                      ? { ...gi.props, __childrenDirection: gi.style?.childrenDirection ?? 'column', __children: childNodes }
                      : gi.props,
                    componentTheme,
                    itemLayout,
                    gi
                  )}

                  {!store.isPreviewMode && isActive && <ActiveToolbar itemId={gi.id} />}
                </div>
              );
            })}
          </div>
        );
        i = j - 1;
      } else {
        const config = COMPONENT_REGISTRY[item.type];
        if (!config) continue;

        const isSelected = store.selectedComponentIds.includes(item.id);
        const isActive = store.activeComponentId === item.id;
        const componentTheme: Theme = {
          ...store.theme,
          background: item.style?.backgroundColor ?? store.theme.background,
          foreground: item.style?.color ?? store.theme.foreground,
          border: item.style?.borderColor ?? store.theme.border,
          radius: item.style?.borderRadius ?? store.theme.radius,
          borderWidth: item.style?.borderWidth ?? store.theme.borderWidth
        };

        const itemLayout = { ...store.layout, direction: (item.style?.direction as Layout['direction']) ?? 'column' };
        const childNodes = item.type === 'Card' ? renderNodes(getCardChildren(item.id), item.style?.childrenDirection ?? 'column') : [];

        nodes.push(
          <div
            key={item.id}
            data-canvas-item={item.id}
            draggable={!store.isPreviewMode}
            onDragStart={(e) => dnd.handleItemDragStart(e, item.id)}
            onDragOver={(e) => dnd.handleItemDragOver(e, item.id, itemLayout.direction)}
            onDrop={(e) => dnd.handleItemDrop(e, item.id)}
            onDragEnd={dnd.handleItemDragEnd}
            onDragLeave={() => dnd.setDragOverId((prev: string | null) => (prev === item.id ? null : prev))}
            onContextMenu={(event) => contextMenu.openContextMenu(event, item.id)}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (!store.isPreviewMode) {
                if (e.shiftKey) store.toggleSelectedComponentId(item.id);
                else { store.setSelectedComponentIds([item.id]); store.setActiveComponentId(item.id); }
              }
            }}
            className={`relative group transition-colors ${itemLayout.direction === 'row' ? 'flex-shrink-0' : 'w-full'}`}
            style={{
              outline: (isSelected || isActive) && !store.isPreviewMode ? `2px solid ${store.theme.primary}` : 'none',
              outlineOffset: '4px',
              borderRadius: `${componentTheme.radius}px`,
              ...getItemFrameStyle(item, itemLayout)
            }}
          >
            {!store.isPreviewMode && dnd.dragOverId === item.id && (
              <div className="absolute inset-x-0 z-40 h-0.5 bg-indigo-500" style={dnd.dropPosition === 'before' ? { top: '-6px' } : { bottom: '-6px' }} />
            )}

            {config.render(
              item.type === 'Card'
                ? { ...item.props, __childrenDirection: item.style?.childrenDirection ?? 'column', __children: childNodes }
                : item.props,
              componentTheme,
              itemLayout,
              item
            )}

            {!store.isPreviewMode && isActive && <ActiveToolbar itemId={item.id} />}
          </div>
        );
      }
    }
    return nodes;
  };

  return { renderNodes };
};