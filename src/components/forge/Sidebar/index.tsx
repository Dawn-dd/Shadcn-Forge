import React from 'react';
import { Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';

// 引入拆分后的组件
import { PresetsPanel } from './components/PresetsPanel';
import { LayoutSettings } from './components/LayoutSettings';
import { ComponentBox } from './components/ComponentBox';
import { StyleEditor } from './components/StyleEditor'; // (即将原有的 activeComponent 样式编辑部分提取成单独组件)

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapsed }) => {
  const { layout, activeComponentId, canvasItems } = useForgeStore();
  const activeComponent = canvasItems.find(item => item.id === activeComponentId);

  return (
    <aside 
      className={`${collapsed ? 'w-[64px]' : 'w-[280px]'} border-r border-slate-200 dark:border-slate-800/60 flex flex-col z-20 transition-all duration-300 shrink-0`} 
      style={{ backgroundColor: layout.appBg }}
    >
      {/* 头部区域 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            {!collapsed && <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">FORGE AI</h2>}
          </div>
          <button onClick={onToggleCollapsed} className="p-1 text-slate-500 hover:bg-slate-100 rounded-md">
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      {/* 主体区域 */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {activeComponent ? (
            <StyleEditor activeComponent={activeComponent} />
          ) : (
            <>
              <PresetsPanel />
              <LayoutSettings />
              <ComponentBox />
            </>
          )}
        </div>
      )}
    </aside>
  );
};