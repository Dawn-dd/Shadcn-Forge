/**
 * 组件样式编辑器组件
 * 用于编辑选中组件的各种样式属性，包括颜色、尺寸、排版等
 */
import React from 'react';
import { Palette } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { ComponentItem } from '@/types';
import { ColorInput } from '@/components/shared/ColorInput';
import { RangeInput } from '@/components/shared/RangeInput';
import { TabButton } from '@/components/shared/TabButton'

interface StyleEditorProps {
  activeComponent: ComponentItem; // 当前正在编辑的组件
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ activeComponent }) => {
  const { theme, layout, updateComponentStyle } = useForgeStore();
  
  // 获取当前组件的排版方向，如果组件没有设置则使用全局布局方向
  const activeDirection = activeComponent.style?.direction ?? layout.direction;

  return (
    <section>
        {/* 标题区域 */}
        <div className="flex items-center gap-2 mb-3 text-indigo-500 dark:text-indigo-400">
            <Palette size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
            组件样式 (COMPONENT STYLE)
            </span>
        </div>
        {/* 样式编辑区域 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
            {/* 当前选中组件类型显示 */}
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                当前选中: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeComponent.type}</span>
            </div>

            {/* 背景颜色 */}
            <ColorInput
                label="背景颜色 (Background)"
                value={activeComponent.style?.backgroundColor || theme.background}
                onChange={(value) => updateComponentStyle(activeComponent.id, { backgroundColor: value })}
            />

            {/* 文字颜色 */}
            <ColorInput
                label="文字颜色 (Text)"
                value={activeComponent.style?.color || theme.foreground}
                onChange={(value) => updateComponentStyle(activeComponent.id, { color: value })}
            />

            {/* 边框颜色 */}
            <ColorInput
                label="边框颜色 (Border)"
                value={activeComponent.style?.borderColor || theme.border}
                onChange={(value) => updateComponentStyle(activeComponent.id, { borderColor: value })}
            />

            {/* 分隔线 */}
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-3"></div>

            {/* 圆角 */}
            <RangeInput
                label="圆角 (Radius)"
                value={activeComponent.style?.borderRadius ?? theme.radius}
                min={0}
                max={24}
                step={1}
                unit="px"
                onChange={(value) => updateComponentStyle(activeComponent.id, { borderRadius: value })}
            />

            {/* 边框宽度 */}
            <RangeInput
                label="边框宽度 (Border W)"
                value={activeComponent.style?.borderWidth ?? theme.borderWidth ?? 1}
                min={0}
                max={8}
                step={1}
                unit="px"
                onChange={(value) => updateComponentStyle(activeComponent.id, { borderWidth: value })}
            />

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
                <TabButton
                    active={(activeComponent.style?.width ?? 'auto') === 'auto'}
                    onClick={() => updateComponentStyle(activeComponent.id, { width: 'auto' })}
                    label="自适应"
                    icon={null}
                />
                <TabButton
                    active={activeComponent.style?.width === 'full'}
                    onClick={() => updateComponentStyle(activeComponent.id, { width: 'full', alignSelf: 'stretch' })}
                    label="铺满"
                    icon={null}
                />
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
                <TabButton
                    active={(activeComponent.style?.height ?? 'auto') === 'auto'}
                    onClick={() => updateComponentStyle(activeComponent.id, { height: 'auto' })}
                    label="自适应"
                    icon={null}
                />
                <TabButton
                    active={activeComponent.style?.height === 'full'}
                    onClick={() => updateComponentStyle(activeComponent.id, { height: 'full' })}
                    label="铺满"
                    icon={null}
                />
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