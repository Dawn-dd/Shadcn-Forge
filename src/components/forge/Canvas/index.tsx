/**
 * Canvas 组件 - 主画布组件，根据活动标签显示不同的视图
 * 包含设计视图、检查视图和代码导出视图
 */
import React from 'react';
import { DesignView } from './DesignView';
import { InspectView } from './InspectView';
import { CodeExporter } from './CodeExporter';
import { useForgeStore } from '@/store/forgeStore';
/**
 * CanvasProps 接口 - 定义组件的属性类型
 */
interface CanvasProps {
  activeTab: 'design' | 'inspect' | 'export';
}

/**
 * VIEWPORT_MAP 常量 - 定义不同预览视口的配置
 * 包含移动端、平板和桌面端的宽度和标签信息
 */
const VIEWPORT_MAP = {
  mobile: { width: 390, label: '390px · Mobile' },
  tablet: { width: 768, label: '768px · Tablet' },
  desktop: { width: null, label: null }
} as const;

/**
 * Canvas 组件 - 主画布组件
 * @param props - 组件属性
 * @returns JSX.Element - 渲染的画布元素
 */
export const Canvas: React.FC<CanvasProps> = ({ activeTab }) => {
  const { layout, theme, previewViewport } = useForgeStore();
  const viewportConfig = VIEWPORT_MAP[previewViewport];

  /**
   * getBackdropStyle 函数 - 根据布局设置获取背景样式
   * @returns object - 背景样式对象
   */
  const getBackdropStyle = () => {
    if (layout.backdrop === 'grid') { // 网格背景样式
      return {
        backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      };
    }
    if (layout.backdrop === 'dots') { // 点状背景样式
      return {
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      };
    }
    return {}; // 默认空样式
  };

  // 统一容器样式类名
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