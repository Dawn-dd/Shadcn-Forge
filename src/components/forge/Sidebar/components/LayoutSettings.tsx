/**
 * 布局设置组件
 * 用于控制画布的布局方向、底纹样式、组件间距和内边距
 */
import React from 'react';
import { Layout, ArrowDown, ArrowRight, Circle, Grid3x3, Sparkles } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';

export const LayoutSettings: React.FC = () => {
  // 从状态管理中获取布局信息和更新方法
  const { layout, updateLayout } = useForgeStore();

  return (
    <section>
      {/* 标题区域 */}
      <div className="flex items-center gap-2 mb-3 text-emerald-500 dark:text-emerald-400">
        <Layout size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          布局与排版 (LAYOUT)
        </span>
      </div>
      {/* 设置面板 */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
        {/* 排版方向控制 */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">排版方向</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1">
            {/* 列方向按钮 */}
            <button onClick={() => updateLayout({ direction: 'column' })} className={`p-2 rounded-md ${layout.direction === 'column' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><ArrowDown size={14} /></button>
            {/* 行方向按钮 */}
            <button onClick={() => updateLayout({ direction: 'row' })} className={`p-2 rounded-md ${layout.direction === 'row' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><ArrowRight size={14} /></button>
          </div>
        </div>
        {/* 背景底纹控制 */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">画布底纹</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1">
            {/* 底纹选项映射 */}
            {[{ value: 'none', icon: Circle }, { value: 'grid', icon: Grid3x3 }, { value: 'dots', icon: Sparkles }].map(({ value, icon: Icon }) => (
              <button key={value} onClick={() => updateLayout({ backdrop: value as 'none' | 'grid' | 'dots' })} className={`p-2 rounded-md ${layout.backdrop === value ? 'bg-white shadow-sm' : 'text-slate-400'}`}><Icon size={14} /></button>
            ))}
          </div>
        </div>
        {/* 分割线 */}
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-3" />
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
  );
};