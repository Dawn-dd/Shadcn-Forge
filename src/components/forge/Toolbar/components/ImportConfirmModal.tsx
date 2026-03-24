/**
 * 导入确认模态框组件
 * 用于显示导入JSON文件的预览信息和确认操作
 */
import React from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { ImportPreviewPayload } from '../hooks/useImportExport';

interface ImportConfirmModalProps {
  pendingImport: ImportPreviewPayload;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportConfirmModal: React.FC<ImportConfirmModalProps> = ({ 
  pendingImport, 
  onConfirm, 
  onCancel 
}) => {
  const { canvasItems } = useForgeStore();

  const pendingCards = pendingImport.canvasItems.filter((item) => item.type === 'Card').length;
  const pendingTopLevel = pendingImport.canvasItems.filter((item) => !item.parentId).length;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">确认导入 JSON</div>
        <div className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          文件：{pendingImport.fileName}
        </div>

        {/* 统计信息面板 */}
        <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">当前画布组件</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{canvasItems.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">导入后组件</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-300">{pendingImport.canvasItems.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">顶层组件</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pendingTopLevel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">卡片组件</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pendingCards}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">包含主题配置</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pendingImport.theme ? '是' : '否'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">包含布局配置</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pendingImport.layout ? '是' : '否'}</span>
          </div>
        </div>

        <div className="mt-3 text-[11px] leading-5 text-amber-600 dark:text-amber-300">
          导入会覆盖当前画布并重置撤销历史。
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            取消
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
};