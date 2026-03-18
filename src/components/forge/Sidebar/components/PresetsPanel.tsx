import React from 'react';
import { Sparkles } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { THEME_PRESETS } from '@/config/themes';

export const PresetsPanel: React.FC = () => {
  const { applyPreset } = useForgeStore();

  return (
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
            className="group relative h-12 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all"
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
  );
};