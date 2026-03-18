import React from 'react';
import { DesignView } from './DesignView';
import { InspectView } from './InspectView';
import { CodeExporter } from './CodeExporter';
import { useForgeStore } from '@/store/forgeStore';

interface CanvasProps {
  activeTab: 'design' | 'inspect' | 'export';
}

const VIEWPORT_MAP = {
  mobile: { width: 390, label: '390px · Mobile' },
  tablet: { width: 768, label: '768px · Tablet' },
  desktop: { width: null, label: null }
} as const;

export const Canvas: React.FC<CanvasProps> = ({ activeTab }) => {
  const { layout, theme, previewViewport } = useForgeStore();
  const viewportConfig = VIEWPORT_MAP[previewViewport];

  const getBackdropStyle = () => {
    if (layout.backdrop === 'grid') {
      return {
        backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      };
    }
    if (layout.backdrop === 'dots') {
      return {
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      };
    }
    return {};
  };

  // 统一容器样式
  const containerClass = "w-full h-full overflow-auto relative";

  return (
    <div className={containerClass} style={{ backgroundColor: layout.appBg }}>
      {/* 背景层 - 仅在 design 模式显示 */}
      {activeTab === 'design' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20" 
          style={{ ...getBackdropStyle(), color: theme.mutedForeground }}
        />
      )}

      {/* 内容区 */}
      <div className="relative z-10 p-4 sm:p-8 flex justify-center items-start min-h-full w-full">
        {activeTab === 'design' && (
          <>
            {viewportConfig.width ? (
              <div
                className="flex flex-col w-full transition-all duration-300"
                style={{ maxWidth: `${viewportConfig.width}px` }}
              >
                {/* 设备帧标题栏 */}
                <div className="flex items-center justify-center mb-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-[10px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 shadow-sm backdrop-blur-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {viewportConfig.label}
                  </div>
                </div>
                {/* 设备内容区 */}
                <div
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
                  style={{ backgroundColor: layout.appBg }}
                >
                  <DesignView />
                </div>
              </div>
            ) : (
              <DesignView />
            )}
          </>
        )}
        {activeTab === 'inspect' && <InspectView />}
        {activeTab === 'export' && <CodeExporter />}
      </div>
    </div>
  );
};