// components/Toolbar/index.tsx
import React from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { AIPrompt } from '@/components/forge/AIPrompt';

// 引入子模块
import { ToolbarTabs } from './components/Tabs';
import { ToolbarActions } from './components/Actions';
import { ImportConfirmModal } from './components/ImportConfirmModal';
import { useImportExport } from './hooks/useImportExport';

interface ToolbarProps {
  activeTab: 'design' | 'inspect' | 'export';
  setActiveTab: (tab: 'design' | 'inspect' | 'export') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTab, setActiveTab }) => {
  const { layout } = useForgeStore();
  
  // 使用自定义 Hook 注入业务逻辑
  const {
    importInputRef,
    pendingImport,
    setPendingImport,
    handleExportZip,
    handleImportJSON,
    handleConfirmImport
  } = useImportExport(setActiveTab);

  return (
    <>
      <div 
        className="h-14 border-b border-slate-200 dark:border-slate-800/60 px-6 flex items-center gap-6 backdrop-blur-xl relative" 
        style={{ 
          backgroundColor: layout.appBg + 'E6',
          zIndex: 90
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左侧：标签页切换 */}
        <ToolbarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 分隔线 */}
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />

        {/* 中间：AI 智能构建按钮 */}
        <AIPrompt />

        {/* 弹性空间，将右侧推到底 */}
        <div className="flex-1" />

        {/* 右侧：工具操作按钮 */}
        <ToolbarActions 
          importInputRef={importInputRef}
          onExportZip={handleExportZip}
          onImportJSON={handleImportJSON}
        />
      </div>

      {/* AI Prompt Portal 挂载点 */}
      <div id="ai-prompt-portal" style={{ position: 'relative', zIndex: 10 }} />

      {/* 导入确认弹窗 */}
      {pendingImport && (
        <ImportConfirmModal 
          pendingImport={pendingImport}
          onConfirm={handleConfirmImport}
          onCancel={() => setPendingImport(null)}
        />
      )}
    </>
  );
};