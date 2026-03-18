// components/Toolbar/ToolbarTabs.tsx
import React from 'react';
import { MousePointer2, Terminal, Code2 } from 'lucide-react';
import { TabButton } from '@/components/shared/TabButton';

interface ToolbarTabsProps {
  activeTab: 'design' | 'inspect' | 'export';
  setActiveTab: (tab: 'design' | 'inspect' | 'export') => void;
}

export const ToolbarTabs: React.FC<ToolbarTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1 border border-slate-200 dark:border-slate-800 shadow-inner">
      <TabButton 
        active={activeTab === 'design'} 
        onClick={() => setActiveTab('design')} 
        icon={<MousePointer2 size={14}/>} 
        label="画布模式" 
      />
      <TabButton 
        active={activeTab === 'inspect'} 
        onClick={() => setActiveTab('inspect')} 
        icon={<Terminal size={14}/>} 
        label="虚拟 DOM" 
      />
      <TabButton 
        active={activeTab === 'export'} 
        onClick={() => setActiveTab('export')} 
        icon={<Code2 size={14}/>} 
        label="导出代码" 
      />
    </div>
  );
};