import React, { useMemo, useState } from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { Palette, Layout, Sparkles, Circle, Grid3x3, ArrowDown, ArrowRight, Box, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { THEME_PRESETS } from '@/config/themes';
import { COMPONENT_REGISTRY } from '@/config/components';

const COMPONENT_GROUPS: Record<string, string[]> = {
  '基础输入': ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Switch'],
  '数据展示': ['Card', 'Badge', 'Avatar', 'Tabs', 'Table', 'Separator'],
  '交互结构': ['Dialog', 'DropdownMenu'],
  '反馈状态': ['Alert', 'Progress', 'Skeleton']
};

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapsed }) => {
  const { 
    theme, 
    layout,  
    updateLayout, 
    applyPreset,
    activeComponentId,
    canvasItems,
    updateComponentStyle,
  } = useForgeStore();
  const [componentSearch, setComponentSearch] = useState('');

  // 获取当前选中的组件
  const activeComponent = canvasItems.find(item => item.id === activeComponentId);
  const activeDirection = activeComponent ? (activeComponent.style?.direction ?? layout.direction) : layout.direction;
  const normalizedSearch = componentSearch.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    const entries = Object.entries(COMPONENT_GROUPS).map(([category, types]) => {
      const matchedTypes = types.filter((type) => {
        const config = COMPONENT_REGISTRY[type];
        if (!config) return false;
        if (!normalizedSearch) return true;

        return (
          type.toLowerCase().includes(normalizedSearch) ||
          config.name.toLowerCase().includes(normalizedSearch)
        );
      });

      return [category, matchedTypes] as const;
    });

    return entries.filter(([, types]) => types.length > 0);
  }, [normalizedSearch]);

  return (
    <aside 
      className={`${collapsed ? 'w-[64px]' : 'w-[280px]'} border-r border-slate-200 dark:border-slate-800/60 flex flex-col z-20 transition-all duration-300 shrink-0`} 
      style={{ backgroundColor: layout.appBg }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              FORGE AI
            </h2>
            </div>
          )}
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={collapsed ? '展开侧栏' : '折叠侧栏'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!collapsed && (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        
        {/* 如果有选中的组件，显示组件样式编辑器 */}
        {activeComponent && (
          <section>
            <div className="flex items-center gap-2 mb-3 text-indigo-500 dark:text-indigo-400">
              <Palette size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                组件样式 (COMPONENT STYLE)
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                当前选中: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeComponent.type}</span>
              </div>

              {/* 背景颜色 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  背景颜色 (Background)
                </label>
                <div className="flex gap-2">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                    <input
                      type="color"
                      value={activeComponent.style?.backgroundColor || theme.background}
                      onChange={(e) => {
                        updateComponentStyle(activeComponent.id, { backgroundColor: e.target.value });
                      }}
                      className="absolute -inset-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={activeComponent.style?.backgroundColor || theme.background}
                    onChange={(e) => {
                      updateComponentStyle(activeComponent.id, { backgroundColor: e.target.value });
                    }}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 文字颜色 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  文字颜色 (Text)
                </label>
                <div className="flex gap-2">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                    <input
                      type="color"
                      value={activeComponent.style?.color || theme.foreground}
                      onChange={(e) => {
                        updateComponentStyle(activeComponent.id, { color: e.target.value });
                      }}
                      className="absolute -inset-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={activeComponent.style?.color || theme.foreground}
                    onChange={(e) => {
                      updateComponentStyle(activeComponent.id, { color: e.target.value });
                    }}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 边框颜色 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  边框颜色 (Border)
                </label>
                <div className="flex gap-2">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                    <input
                      type="color"
                      value={activeComponent.style?.borderColor || theme.border}
                      onChange={(e) => {
                        updateComponentStyle(activeComponent.id, { borderColor: e.target.value });
                      }}
                      className="absolute -inset-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={activeComponent.style?.borderColor || theme.border}
                    onChange={(e) => {
                      updateComponentStyle(activeComponent.id, { borderColor: e.target.value });
                    }}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 分隔线 */}
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-3"></div>

              {/* 圆角 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    圆角 (Radius)
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {((activeComponent.style?.borderRadius ?? theme.radius) / 16).toFixed(1)}rem
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={activeComponent.style?.borderRadius ?? theme.radius}
                  onChange={(e) => {
                    updateComponentStyle(activeComponent.id, { borderRadius: parseInt(e.target.value) });
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>

              {/* 边框宽度 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    边框宽度 (Border W)
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {activeComponent.style?.borderWidth ?? theme.borderWidth ?? 1}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={activeComponent.style?.borderWidth ?? theme.borderWidth ?? 1}
                  onChange={(e) => {
                    updateComponentStyle(activeComponent.id, { borderWidth: parseInt(e.target.value) });
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>

              {/* 单组件排版方向 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    排版方向 (Direction)
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {activeComponent.style?.direction ?? layout.direction}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateComponentStyle(activeComponent.id, { direction: 'column' })}
                    className={`flex-1 py-1 text-xs rounded ${
                      (activeComponent.style?.direction ?? layout.direction) === 'column' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                    title="Column"
                  >
                    垂直
                  </button>
                  <button
                    onClick={() => updateComponentStyle(activeComponent.id, { direction: 'row' })}
                    className={`flex-1 py-1 text-xs rounded ${
                      (activeComponent.style?.direction ?? layout.direction) === 'row' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                    title="Row"
                  >
                    横向
                  </button>
                </div>
              </div>

              {/* 卡片内排版方向（仅 Card 组件显示） */}
              {activeComponent.type === 'Card' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      卡片内排版 (Children)
                    </label>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {activeComponent.style?.childrenDirection ?? 'column'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateComponentStyle(activeComponent.id, { childrenDirection: 'column' })}
                      className={`flex-1 py-1 text-xs rounded ${
                        (activeComponent.style?.childrenDirection ?? 'column') === 'column'
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      垂直
                    </button>
                    <button
                      onClick={() => updateComponentStyle(activeComponent.id, { childrenDirection: 'row' })}
                      className={`flex-1 py-1 text-xs rounded ${
                        activeComponent.style?.childrenDirection === 'row'
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      横向
                    </button>
                  </div>
                </div>
              )}

              {activeDirection === 'row' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      横向位置 (Horizontal)
                    </label>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {activeComponent.style?.horizontalOffset ?? 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={activeComponent.style?.horizontalOffset ?? 0}
                    onChange={(e) => updateComponentStyle(activeComponent.id, { horizontalOffset: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>左侧</span>
                    <span>任意位置</span>
                    <span>右侧</span>
                  </div>
                </div>
              )}

              {/* 单组件宽度 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    宽度 (Width)
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {activeComponent.style?.width ?? 'auto'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateComponentStyle(activeComponent.id, { width: 'auto' })}
                    className={`flex-1 py-1 text-xs rounded ${
                      (activeComponent.style?.width ?? 'auto') === 'auto'
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    自适应
                  </button>
                  <button
                    onClick={() => updateComponentStyle(activeComponent.id, { width: 'full', alignSelf: 'stretch' })}
                    className={`flex-1 py-1 text-xs rounded ${
                      activeComponent.style?.width === 'full'
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    铺满
                  </button>
                </div>
                <input
                  type="text"
                  value={typeof activeComponent.style?.width === 'string' ? activeComponent.style.width : 'auto'}
                  onChange={(e) => updateComponentStyle(activeComponent.id, { width: e.target.value || 'auto' })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如 320px / 50% / auto"
                />
              </div>

              {/* 单组件高度 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    高度 (Height)
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {activeComponent.style?.height ?? 'auto'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateComponentStyle(activeComponent.id, { height: 'auto' })}
                    className={`flex-1 py-1 text-xs rounded ${
                      (activeComponent.style?.height ?? 'auto') === 'auto'
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    自适应
                  </button>
                  <button
                    onClick={() => updateComponentStyle(activeComponent.id, { height: 'full' })}
                    className={`flex-1 py-1 text-xs rounded ${
                      activeComponent.style?.height === 'full'
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    铺满
                  </button>
                </div>
                <input
                  type="text"
                  value={typeof activeComponent.style?.height === 'string' ? activeComponent.style.height : 'auto'}
                  onChange={(e) => updateComponentStyle(activeComponent.id, { height: e.target.value || 'auto' })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如 56px / 100% / auto"
                />
              </div>

              {/* 重置按钮 */}
              <button
                onClick={() => {
                  updateComponentStyle(activeComponent.id, {
                    backgroundColor: undefined,
                    color: undefined,
                    borderColor: undefined,
                    borderRadius: undefined,
                    borderWidth: undefined,
                    direction: undefined,
                    childrenDirection: undefined,
                    width: undefined,
                    height: undefined,
                    alignSelf: undefined,
                    horizontalOffset: undefined
                  });
                }}
                className="w-full py-2 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                重置为默认样式
              </button>
            </div>
          </section>
        )}

        {/* 一键预设（仅在未选中组件时显示） */}
        {!activeComponent && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                一键预设 (PRESETS)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(THEME_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className="group relative h-12 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
                  style={{ backgroundColor: preset.primary }}
                  title={name}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white drop-shadow">
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 布局与排版（始终显示） */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-emerald-500 dark:text-emerald-400">
            <Layout size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              布局与排版 (LAYOUT)
            </span>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
            {/* 排版方向 */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                排版方向
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1">
                <button
                  onClick={() => updateLayout({ direction: 'column' })}
                  className={`p-2 rounded-md transition-all ${
                    layout.direction === 'column'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => updateLayout({ direction: 'row' })}
                  className={`p-2 rounded-md transition-all ${
                    layout.direction === 'row'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 画布底纹 */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                画布底纹
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1">
                {[
                  { value: 'none' as const, icon: Circle },
                  { value: 'grid' as const, icon: Grid3x3 },
                  { value: 'dots' as const, icon: Sparkles }
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => updateLayout({ backdrop: value })}
                    className={`p-2 rounded-md transition-all ${
                      layout.backdrop === value
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700 my-3"></div>

            {/* Gap 间距 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  GAP (组件间距)
                </label>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {(layout.gap / 16).toFixed(1)}rem
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={64}
                value={layout.gap}
                onChange={(e) => updateLayout({ gap: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>

            {/* Padding 内边距 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  PAD (画布内距)
                </label>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {(layout.padding / 16).toFixed(1)}rem
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={64}
                value={layout.padding}
                onChange={(e) => updateLayout({ padding: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>
          </div>
        </section>

        {/* 组件箱（仅在未选中组件时显示） */}
        {!activeComponent && (
          <section>
            <div className="flex items-center gap-2 mb-3 text-orange-500 dark:text-orange-400">
              <Box size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                组件箱 ({Object.keys(COMPONENT_REGISTRY).length} COMPONENTS)
              </span>
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={componentSearch}
                onChange={(event) => setComponentSearch(event.target.value)}
                placeholder="搜索组件名称..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              />
            </div>
            
            <div className="space-y-4">
              {/* 按分类显示 */}
              {filteredGroups.map(([category, types]) => (
                <div key={category}>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-2">
                    — {category}
                  </div>
                  <div className="space-y-2">
                    {types.map((type) => {
                      const config = COMPONENT_REGISTRY[type];
                      if (!config) return null;
                      return (
                        <div
                          key={type}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('forge-type', type);
                            e.dataTransfer.setData('text/plain', `forge-type:${type}`);
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          onClick={() => useForgeStore.getState().addComponent(type)}
                          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:border-orange-500 hover:shadow-md transition-all group"
                        >
                          <div className="text-slate-400 group-hover:text-orange-500 transition-colors shrink-0">
                            {config.icon}
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                            {config.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  未找到匹配组件
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      )}
    </aside>
  );
};