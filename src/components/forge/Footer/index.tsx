// src/components/forge/Footer.tsx
import React from 'react';
import { useForgeStore } from '@/store/forgeStore';

export const Footer: React.FC = () => {
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
      <div className="flex items-center gap-4">
        <span className="hidden md:flex items-center gap-3 text-slate-400 normal-case tracking-normal font-medium">
          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono">Del</kbd>
          <span className="text-[9px]">删除</span>
          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono">⌃C</kbd>
          <span className="text-[9px]">复制</span>
          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono">⌃V</kbd>
          <span className="text-[9px]">粘贴</span>
          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono">⌃Z</kbd>
          <span className="text-[9px]">撤销</span>
          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono">Esc</kbd>
          <span className="text-[9px]">取消选中</span>
        </span>
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