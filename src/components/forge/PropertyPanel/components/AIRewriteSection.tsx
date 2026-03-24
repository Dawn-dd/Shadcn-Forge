/**
 * AI局部重构组件
 * 用于展示和管理AI重构的选项和结果
 */
import { Sparkles, Loader2, ChevronDown, Maximize2 } from 'lucide-react';
import { ComponentItem, Theme, Layout } from '@/types';
import { LocalRewriteMode, LocalRewriteCandidate } from '../types';
import { renderLocalCandidatePreview, PREVIEW_SCALE, getCandidateDiffSummary } from '../utils';
import { useLocalAIRewrite } from '../hooks/useLocalAIRewrite';

// 定义AI重写模式选项
const LOCAL_REWRITE_MODE_OPTIONS: Array<{ value: LocalRewriteMode; label: string }> = [
  { value: 'copy', label: '改文案' },
  { value: 'structure', label: '改结构' },
  { value: 'both', label: '都改' }
];

/**
 * AI局部重构组件的属性接口
 */
interface AIRewriteSectionProps {
  activeComponent: ComponentItem;
  theme: Theme;
  layout: Layout;
  currentCardChildren: ComponentItem[];
  aiState: ReturnType<typeof useLocalAIRewrite>;
}

/**
 * AI局部重构组件
 * 提供UI界面让用户进行AI局部重构操作
 */
export const AIRewriteSection: React.FC<AIRewriteSectionProps> = ({ activeComponent, theme, layout, currentCardChildren, aiState }) => {
  // 从AI状态中解构出所需的状态和方法
  const {
    localAiExpanded, setLocalAiExpanded, // 展开/收起状态
    localAiMode, setLocalAiMode, // 重写模式
    localAiPrompt, setLocalAiPrompt, // 用户输入的提示
    localAiLoading, localAiError, // 加载状态和错误信息
    handleLocalAIRewrite, localAiCandidates, // 处理重写和候选方案
    focusedCandidateIndex, setFocusedCandidateIndex, // 聚焦的候选方案索引
    setPreviewCandidateIndex, applyLocalCandidate // 预览和应用候选方案
  } = aiState;

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/70 dark:border-purple-900/40 dark:bg-purple-950/20">
      {/* 展开/收起按钮 */}
      <button
        type="button"
        onClick={() => setLocalAiExpanded((prev: boolean) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          {/* 标题和描述 */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-300">
            <Sparkles size={12} />
            {activeComponent.type === 'Card' ? 'AI 局部重构卡片' : 'AI 局部重构组件'}
          </div>
          <div className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            {localAiExpanded ? (activeComponent.type === 'Card' ? '会重写卡片 props，并替换卡片内子组件。' : '会重写当前组件 props，不影响其他组件。') : '展开后可对当前选中区域做局部 AI 改写。'}
          </div>
        </div>
        {/* 展开/收起图标 */}
        <ChevronDown size={16} className={`shrink-0 text-purple-500 transition-transform ${localAiExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* 展开后的内容区域 */}
      {localAiExpanded && (
        <div className="space-y-3 border-t border-purple-200/70 px-5 pb-5 pt-4 dark:border-purple-900/30">
          {/* 模式选择器 */}
          <div className="flex gap-2 rounded-xl bg-white/70 p-1 dark:bg-slate-900/60">
            {LOCAL_REWRITE_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLocalAiMode(option.value)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${localAiMode === option.value ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {/* 提示输入框 */}
          <textarea
            value={localAiPrompt}
            onChange={(e) => setLocalAiPrompt(e.target.value)}
            disabled={localAiLoading}
            placeholder={activeComponent.type === 'Card' ? '例如：把这个卡片改成登录卡片...' : '例如：把这个按钮改成更专业的确认按钮'}
            className="min-h-[84px] w-full resize-y rounded-md border border-purple-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-purple-500 dark:border-purple-900/40 dark:bg-slate-900 dark:text-slate-200"
          />
          {/* 生成方案按钮 */}
          <button
            onClick={handleLocalAIRewrite}
            disabled={localAiLoading || !localAiPrompt.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {localAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {localAiLoading ? '生成候选中...' : '生成 2 个方案'}
          </button>
          {/* 错误信息显示 */}
          {localAiError && <div className="text-[10px] text-red-500">{localAiError}</div>}
          
          {/* 候选方案展示 */}
          {localAiCandidates.length > 0 && (
            <div className="space-y-3 pt-1">
              {localAiCandidates.map((candidate: LocalRewriteCandidate, index: number) => (
                <div
                  key={`${candidate.summary || 'candidate'}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setFocusedCandidateIndex(index); setPreviewCandidateIndex(index); }}
                  className={`group block w-full cursor-pointer rounded-2xl border bg-white/80 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/70 ${focusedCandidateIndex === index ? 'border-purple-500 ring-2 ring-purple-500/20 dark:border-purple-400' : 'border-purple-200 hover:border-purple-400 dark:border-purple-900/40'}`}
                >
                  <div className="space-y-3">
                    {/* 预览区域 */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 transition-colors group-hover:border-purple-300 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900" style={{ height: '172px' }}>
                      <div className="h-full overflow-hidden p-3" style={{ backgroundColor: theme.workspaceBg ?? theme.muted }}>
                        <div className="pointer-events-none" style={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', width: `${100 / PREVIEW_SCALE}%` }}>
                          {renderLocalCandidatePreview(activeComponent, candidate, theme, layout)}
                        </div>
                      </div>
                    </div>
                    {/* 方案详情 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {/* 方案标题和标签 */}
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500">方案 {index + 1}</div>
                          <div className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                            <Maximize2 size={10} /> 预览
                          </div>
                        </div>
                        {/* 方案摘要 */}
                        <div className="mt-1 text-xs font-medium leading-5 text-slate-700 dark:text-slate-200">{candidate.summary || '局部重构候选方案'}</div>
                        {/* 方案统计信息 */}
                        <div className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                          props {Object.keys(candidate.targetProps || {}).length} 项
                          {activeComponent.type === 'Card' && candidate.children ? `，子组件 ${candidate.children.length} 个` : ''}
                        </div>
                        {/* 方案差异说明 */}
                        <div className="mt-2 space-y-1">
                          {getCandidateDiffSummary(activeComponent, candidate, currentCardChildren.length).map((line) => (
                            <div key={line} className="text-[10px] leading-4 text-slate-500 dark:text-slate-400">{line}</div>
                          ))}
                        </div>
                      </div>
                      {/* 应用按钮 */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(event) => { event.stopPropagation(); applyLocalCandidate(candidate); }}
                        className="shrink-0 cursor-pointer rounded-xl bg-purple-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-purple-700"
                      >
                        应用
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};