import React, { useState } from 'react';
import { Toolbar } from '@/components/forge/Toolbar';
import { Sidebar } from '@/components/forge/Sidebar';
import { Canvas } from '@/components/forge/Canvas';
import { PropertyPanel } from '@/components/forge/PropertyPanel';
import { useForgeStore } from '@/store/forgeStore';

const App: React.FC = () => {
  const { isDarkMode, layout } = useForgeStore();
  const [activeTab, setActiveTab] = useState<'design' | 'inspect' | 'export'>('design');

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div 
        className="flex h-screen text-slate-800 dark:text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30 transition-colors duration-300" 
        style={{ backgroundColor: layout.appBg }}
      >
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300">
          {/* 工具栏 */}
          <Toolbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 画布或代码导出 */}
          <Canvas activeTab={activeTab} />
          
          {/* 底部状态栏 */}
          <Footer />
        </main>

        {/* 右侧属性面板 */}
        <PropertyPanel />
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const { layout, history, historyStep, canvasItems, clearCanvas } = useForgeStore();
  const canClear = canvasItems.length > 0;

  return (
    <footer 
      className="h-7 border-t border-slate-200 dark:border-slate-800/60 px-4 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10 shrink-0" 
      style={{ backgroundColor: layout.appBg }}
    >
      <div className="flex gap-6">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          History: {historyStep}/{history.length - 1}
        </span>
        <span>Components: {canvasItems.length}</span>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => {
            if (!canClear) return;
            if (window.confirm('确认要清空画布吗？此操作可通过撤销恢复。')) {
              clearCanvas();
            }
          }}
          disabled={!canClear}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-red-600 shadow-sm transition-colors hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
        >
          清空画布
        </button>
      </div>
    </footer>
  );
};

export default App;