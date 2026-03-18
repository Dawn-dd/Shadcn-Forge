import React from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { ContextMenuState } from '../utils';

interface ContextMenuProps {
  contextMenu: ContextMenuState;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ contextMenu, onClose }) => {
  const { 
    canvasItems, duplicateComponent, removeSelectedComponents, 
    removeComponent, moveComponent, updateComponentParent, selectedComponentIds 
  } = useForgeStore();

  const contextTarget = canvasItems.find((item) => item.id === contextMenu.itemId);
  const cardItems = canvasItems.filter((item) => item.type === 'Card');

  if (!contextTarget) return null;

  const handleDeleteAction = () => {
    if (selectedComponentIds.length > 1 && selectedComponentIds.includes(contextTarget.id)) {
      removeSelectedComponents();
    } else {
      removeComponent(contextTarget.id);
    }
    onClose();
  };

  return (
    <div
      className="fixed z-[90] min-w-[180px] rounded-xl border border-slate-200 bg-white p-1 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      style={{ left: contextMenu.x + 8, top: contextMenu.y + 8 }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => { duplicateComponent(contextTarget.id); onClose(); }}
        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        克隆组件
      </button>
      <button
        type="button"
        onClick={handleDeleteAction}
        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"
      >
        {selectedComponentIds.length > 1 && selectedComponentIds.includes(contextTarget.id)
          ? `删除所选 ${selectedComponentIds.length} 项`
          : '删除组件'}
      </button>
      <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
      <button
        type="button"
        onClick={() => { moveComponent(contextTarget.id, 'up'); onClose(); }}
        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        上移
      </button>
      <button
        type="button"
        onClick={() => { moveComponent(contextTarget.id, 'down'); onClose(); }}
        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        下移
      </button>
      <button
        type="button"
        onClick={() => { updateComponentParent(contextTarget.id, undefined); onClose(); }}
        className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        移到顶层
      </button>
      {cardItems.filter((card) => card.id !== contextTarget.id).slice(0, 4).map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => { updateComponentParent(contextTarget.id, card.id); onClose(); }}
          className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          移到卡片：{String(card.props.title || 'Card')}
        </button>
      ))}
    </div>
  );
};