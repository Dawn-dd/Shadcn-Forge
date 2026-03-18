import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';

export const EmptyState: React.FC = () => {
  const { theme, addComponent } = useForgeStore();

  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl transition-colors"
      style={{ 
        borderColor: theme.border,
        color: theme.mutedForeground,
        backgroundColor: theme.background
      }}
    >
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.muted }}>
          <Sparkles size={20} style={{ color: theme.foreground }} />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold" style={{ color: theme.foreground }}>从空白画布开始搭建</p>
          <p className="text-sm opacity-80">拖拽左侧组件到这里，或者先添加一个基础块，再继续像搭 shadcn/ui 一样逐步组合。</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['Card', 'Input', 'Button'].map((type) => {
            const config = COMPONENT_REGISTRY[type];
            if (!config) return null;
            return (
              <button
                key={type}
                type="button"
                onClick={() => addComponent(type)}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:border-indigo-400 hover:text-indigo-600"
                style={{ borderColor: theme.border, color: theme.foreground }}
              >
                <Plus size={12} />
                {config.name}
              </button>
            );
          })}
        </div>
        <p className="text-xs opacity-60">也可以直接用顶部 AI 智能构建，输入“登录卡片”或“注册表单”。</p>
      </div>
    </div>
  );
};