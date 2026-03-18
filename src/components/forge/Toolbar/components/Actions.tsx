// components/Toolbar/ToolbarActions.tsx
import React from 'react';
import { Edit3, Play, Undo2, Redo2, Sun, Moon, Upload, Download } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';

interface ToolbarActionsProps {
    importInputRef: React.RefObject<HTMLInputElement | null>;
    onExportZip: () => void;
    onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ToolbarActions: React.FC<ToolbarActionsProps> = ({ 
  importInputRef, 
  onExportZip, 
  onImportJSON 
}) => {
  const { 
    isDarkMode, toggleDarkMode, 
    undo, redo, historyStep, history,
    isPreviewMode, togglePreviewMode
  } = useForgeStore();

  const canUndo = historyStep > 0;
  const canRedo = historyStep < history.length - 1;

  return (
    <div className="flex items-center gap-4 shrink-0">
      {/* 预览 / 编辑切换 */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
        <button onClick={togglePreviewMode} className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 px-3 ${!isPreviewMode ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          <Edit3 size={14}/> <span className="text-xs font-bold hidden sm:inline">编辑</span>
        </button>
        <button onClick={togglePreviewMode} className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 px-3 ${isPreviewMode ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          <Play size={14}/> <span className="text-xs font-bold hidden sm:inline">预览</span>
        </button>
      </div>

      {/* 撤销 / 重做 */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
        <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded-md text-slate-500 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30">
          <Undo2 size={14}/>
        </button>
        <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded-md text-slate-500 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30">
          <Redo2 size={14}/>
        </button>
      </div>

      {/* 暗黑模式切换 */}
      <div className="items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner hidden sm:flex">
        <button onClick={toggleDarkMode} className={`p-1.5 rounded-md transition-all ${!isDarkMode ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`} title="浅色模式">
          <Sun size={14}/>
        </button>
        <button onClick={toggleDarkMode} className={`p-1.5 rounded-md transition-all ${isDarkMode ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`} title="深色模式">
          <Moon size={14}/>
        </button>
      </div>

      {/* 导入 / 导出 */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
        <button onClick={() => importInputRef.current?.click()} className="p-1.5 rounded-md text-slate-500 hover:bg-white dark:hover:bg-slate-700" title="从 JSON 导入">
          <Upload size={14} />
        </button>
        <button onClick={onExportZip} className="p-1.5 rounded-md text-slate-500 hover:bg-white dark:hover:bg-slate-700" title="导出 ZIP">
          <Download size={14} />
        </button>
      </div>

      {/* 隐藏的 File Input */}
      <input ref={importInputRef} type="file" accept="application/json,.json" onChange={onImportJSON} className="hidden" />
    </div>
  );
};