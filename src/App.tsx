import React, { useState } from 'react';
import { Toolbar } from '@/components/forge/Toolbar';
import { Sidebar } from '@/components/forge/Sidebar';
import { Canvas } from '@/components/forge/Canvas';
import { PropertyPanel } from '@/components/forge/PropertyPanel';
import { Footer } from '@/components/forge/Footer';
import { useForgeStore } from '@/store/forgeStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

const App: React.FC = () => {
  const { isDarkMode, layout } = useForgeStore();
  const [activeTab, setActiveTab] = useState<'design' | 'inspect' | 'export'>('design');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 激活全局快捷键
  useGlobalShortcuts();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div 
        className="flex h-screen text-slate-800 dark:text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30 transition-colors duration-300" 
        style={{ backgroundColor: layout.appBg }}
      >
        {/* 左侧边栏 */}
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)} />

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300">
          <Toolbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <Canvas activeTab={activeTab} />
          <Footer />
        </main>

        {/* 右侧属性面板 */}
        <PropertyPanel />
      </div>
    </div>
  );
};

export default App;