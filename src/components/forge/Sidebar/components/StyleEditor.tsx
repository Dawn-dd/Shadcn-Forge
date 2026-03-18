// src/components/forge/Sidebar/StyleEditor.tsx
import React from 'react';
import { Palette } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { ComponentItem } from '@/types';

interface StyleEditorProps {
  activeComponent: ComponentItem;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ activeComponent }) => {
  const { theme, layout, updateComponentStyle } = useForgeStore();
  
  const activeDirection = activeComponent.style?.direction ?? layout.direction;

  return (
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