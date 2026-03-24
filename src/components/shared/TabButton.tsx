/**
 * TabButton 组件，用于创建一个可切换的标签按钮
 * 支持图标和标签文本，并根据激活状态改变样式
 */
import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ 
  active, 
  onClick, 
  icon, 
  label, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md 
        text-xs font-bold transition-all
        ${className}
        ${
          active
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
        }
      `}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};