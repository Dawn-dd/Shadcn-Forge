/**
 * 预设面板组件
 * 用于展示和选择主题预设
 */
import React from 'react';
import { Sparkles } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { THEME_PRESETS } from '@/config/themes';

/**
 * PresetsPanel组件定义
 * 一个展示主题预设选项的面板，允许用户一键应用预设主题
 */
export const PresetsPanel: React.FC = () => {
  const { applyPreset } = useForgeStore(); // 从ForgeStore中获取applyPreset方法

  return (
    <section>
      {/* 面板标题区域 */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={12} className="text-indigo-500 dark:text-indigo-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
          一键预设 (PRESETS)
        </span>
      </div>
      {/* 预设选项网格 */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(THEME_PRESETS).map(([name, preset]) => (
          <button
            key={name}
            onClick={() => applyPreset(name)}
            className="group relative h-12 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all"
            style={{ backgroundColor: preset.primary }}
            title={name} // 设置按钮提示文本
          >
            {/* 悬停时的渐变遮罩效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* 预设名称标签 */}
            <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white drop-shadow">
              {name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};