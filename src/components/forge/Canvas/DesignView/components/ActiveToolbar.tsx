/**
 * ActiveToolbar组件 - 用于显示活动元素的工具栏
 * 提供移动、复制、删除等功能
 */
import React from 'react';
import { Trash2, Copy, GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';

/**
 * ActiveToolbar组件的属性接口
 */
interface ActiveToolbarProps {
  itemId: string;
}

/**
 * ActiveToolbar组件 - 活动元素的工具栏组件
 */
export const ActiveToolbar: React.FC<ActiveToolbarProps> = ({ itemId }) => {
  const { 
    theme, moveComponent, duplicateComponent, 
    removeComponent, removeSelectedComponents, selectedComponentIds 
  } = useForgeStore();

  /**
   * 处理删除操作的函数
   * @param {React.MouseEvent} e - 鼠标事件对象
   */
  const handleDeleteAction = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (selectedComponentIds.length > 1 && selectedComponentIds.includes(itemId)) {
      removeSelectedComponents();
    } else {
      removeComponent(itemId);
    }
  };

  return (
    <div
      className="absolute -top-10 left-0 flex items-center gap-1 px-2 py-1 rounded-lg shadow-lg z-10"
      style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
    >
      {/* 向上移动按钮 */}
      <button onClick={(e) => { e.stopPropagation(); moveComponent(itemId, 'up'); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><MoveUp size={14} /></button>
      {/* 向下移动按钮 */}
      <button onClick={(e) => { e.stopPropagation(); moveComponent(itemId, 'down'); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><MoveDown size={14} /></button>
      {/* 分隔线 */}
      <div className="w-px h-4 mx-1" style={{ backgroundColor: theme.border }} />
      {/* 复制按钮 */}
      <button onClick={(e) => { e.stopPropagation(); duplicateComponent(itemId); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><Copy size={14} /></button>
      {/* 删除按钮 */}
      <button onClick={(e) => { handleDeleteAction(e); }} className="p-1.5 rounded hover:bg-red-50 text-red-500 dark:hover:bg-red-900/30"><Trash2 size={14} /></button>
      {/* 拖动手柄 */}
      <div className="cursor-move p-1.5" style={{ color: theme.mutedForeground }}><GripVertical size={14} /></div>
    </div>
  );
};