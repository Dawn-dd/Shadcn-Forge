/**
 * 侧边栏组件
 * 用于显示应用的不同功能面板，包括预设面板、布局设置和组件选择
 * 支持折叠/展开功能，并根据当前活动组件显示样式编辑器
 */
import React from 'react';
import { Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';

import { PresetsPanel } from './components/PresetsPanel';
import { LayoutSettings } from './components/LayoutSettings';
import { ComponentBox } from './components/ComponentBox';
import { StyleEditor } from './components/StyleEditor';

/**
 * 侧边栏组件的属性接口
 */
interface SidebarProps {
  collapsed: boolean; // 是否折叠侧边栏
  onToggleCollapsed: () => void; // 切换折叠状态的回调函数
}


export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapsed }) => {
  // 从store中获取必要的状态
  const { layout, activeComponentId, canvasItems } = useForgeStore();
  // 根据活动组件ID查找当前活动组件
  const activeComponent = canvasItems.find(item => item.id === activeComponentId);

  return (
    <aside 
      className={`${collapsed ? 'w-[64px]' : 'w-[280px]'} border-r border-slate-200 dark:border-slate-800/60 flex flex-col z-20 transition-all duration-300 shrink-0`} 
      style={{ backgroundColor: layout.appBg }} // 设置背景色
    >
      {/* 头部区域 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* 应用logo（仅在展开时显示） */}
            {!collapsed && <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>}
            {/* 应用标题*/}
            {!collapsed && <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">FORGE AI</h2>}
          </div>
          {/* 折叠/展开按钮 */}
          <button onClick={onToggleCollapsed} className="p-1 text-slate-500 hover:bg-slate-100 rounded-md">
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      {/* 主体区域 */}
      {/* 仅在侧边栏展开时显示内容 */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {/* 如果有活动组件，显示样式编辑器 */}
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