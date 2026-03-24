import { useState } from 'react';
import { SlidersHorizontal, Code2, X, Copy, Check } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { generateComponentJSXSnippet } from '@/lib/codeGenerator';

// 引入自定义 hooks 和组件
import { useLocalAIRewrite } from './hooks/useLocalAIRewrite';
import { PropsForm } from './components/PropsForm';
import { AIRewriteSection } from './components/AIRewriteSection';
import { CandidatePreviewModal } from './components/CandidatePreviewModal';

/**
 * PropertyPanel 组件
 * 功能：属性面板组件，用于编辑选中组件的属性和进行 AI 重写操作
 */
export const PropertyPanel: React.FC = () => {
  const {
    layout,
    canvasItems,
    activeComponentId,
    setActiveComponentId,
    updateComponentProp,
    theme
  } = useForgeStore();

  const [copiedJSX, setCopiedJSX] = useState(false);

  const activeComponent = canvasItems.find((item) => item.id === activeComponentId);
  const aiState = useLocalAIRewrite(activeComponent);

  if (!activeComponent) return null;

  const currentCardChildren = canvasItems.filter((item) => item.parentId === activeComponent.id);
  const previewCandidate = aiState.previewCandidateIndex !== null ? aiState.localAiCandidates[aiState.previewCandidateIndex] : null;

  /**
   * 处理复制组件 JSX 代码的函数
   * 将当前组件的 JSX 代码复制到剪贴板
   */
  const handleCopyComponentJSX = async () => {
    try {
      const snippet = generateComponentJSXSnippet(activeComponent, theme);
      await navigator.clipboard.writeText(snippet);
      setCopiedJSX(true);
      setTimeout(() => setCopiedJSX(false), 1500);
    } catch (error) {
      console.error('Copy JSX failed', error);
      setCopiedJSX(false);
    }
  };

  return (
    <aside
      className="relative w-[320px] border-l border-slate-200 dark:border-slate-800/60 flex flex-col z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.05)] transition-all animate-in slide-in-from-right-8 flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
      style={{ backgroundColor: layout.appBg }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          <SlidersHorizontal size={16} />
          {COMPONENT_REGISTRY[activeComponent.type].name}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyComponentJSX}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
            title="复制当前组件 JSX"
          >
            {copiedJSX ? <Check size={12} /> : <Copy size={12} />}
            {copiedJSX ? '已复制' : '复制 JSX'}
          </button>
          <button
            onClick={() => setActiveComponentId(null)}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-md"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 custom-scrollbar">
        {/* 1. AI 局部重写区块 */}
        <AIRewriteSection
          activeComponent={activeComponent}
          theme={theme}
          layout={layout}
          currentCardChildren={currentCardChildren}
          aiState={aiState}
        />

        {/* 2. 基础属性编辑器 */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <Code2 size={12} />
            Props 编辑器
          </div>
          <PropsForm 
            activeComponent={activeComponent} 
            updateComponentProp={updateComponentProp} 
          />
        </div>
      </div>

      {/* 3. 全屏差异对比预览层 */}
      {previewCandidate && (
        <CandidatePreviewModal
          activeComponent={activeComponent}
          candidate={previewCandidate}
          theme={theme}
          layout={layout}
          currentCardChildren={currentCardChildren}
          previewCandidateIndex={aiState.previewCandidateIndex as number}
          aiState={aiState}
        />
      )}
    </aside>
  );
};