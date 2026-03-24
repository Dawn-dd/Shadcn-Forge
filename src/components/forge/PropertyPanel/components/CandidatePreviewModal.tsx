/**
 * CandidatePreviewModal 组件
 * 用于展示AI重构候选方案的预览模态框
 * 支持方案预览和对比当前两种模式
 */
import { X, Loader2, Sparkles } from 'lucide-react';
import { ComponentItem, Theme, Layout } from '@/types';
import { LocalRewriteCandidate } from '../types';
import { getPropDiffEntries, getCardStructureDiff, getCandidateDiffSummary, formatDiffValue, renderComponentPreview, renderLocalCandidatePreview } from '../utils';
import { useLocalAIRewrite } from '../hooks/useLocalAIRewrite';

/**
 * 候选方案预览模态框的属性接口
 */
interface CandidatePreviewModalProps {
  activeComponent: ComponentItem;
  candidate: LocalRewriteCandidate;
  theme: Theme;
  layout: Layout;
  currentCardChildren: ComponentItem[];
  previewCandidateIndex: number;
  aiState: ReturnType<typeof useLocalAIRewrite>;
}

export const CandidatePreviewModal: React.FC<CandidatePreviewModalProps> = ({ activeComponent, candidate, theme, layout, currentCardChildren, previewCandidateIndex, aiState }) => {
  const {
    setPreviewCandidateIndex,
    previewCompareMode, setPreviewCompareMode,
    candidateFollowupPrompt, setCandidateFollowupPrompt,
    candidateFollowupLoading, candidateFollowupError,
    handleFollowupRefine, applyLocalCandidate
  } = aiState;

  const propDiffEntries = getPropDiffEntries(activeComponent, candidate);
  const changedPropCount = propDiffEntries.filter((entry) => entry.changed).length;
  const cardStructureDiff = activeComponent.type === 'Card' ? getCardStructureDiff(currentCardChildren, candidate.children) : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setPreviewCandidateIndex(null)}>
      <div className="flex max-h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500">方案 {previewCandidateIndex + 1}</div>
            <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{candidate.summary || '局部重构候选方案'}</div>
          </div>
          <button type="button" onClick={() => setPreviewCandidateIndex(null)} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="mb-3 flex items-center gap-2">
            <button type="button" onClick={() => setPreviewCompareMode(false)} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${!previewCompareMode ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>方案预览</button>
            <button type="button" onClick={() => setPreviewCompareMode(true)} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${previewCompareMode ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>对比当前</button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900" style={{ backgroundColor: theme.workspaceBg ?? theme.muted }}>
            {previewCompareMode ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">变更点</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">props 变化 {changedPropCount}</span>
                  {activeComponent.type === 'Card' && cardStructureDiff && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cardStructureDiff.changed ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}>
                      {cardStructureDiff.changed ? '结构已调整' : '结构基本不变'}
                    </span>
                  )}
                </div>
                {activeComponent.type === 'Card' && cardStructureDiff && (
                  <div className="space-y-1 rounded-2xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-900/40 dark:bg-purple-900/20">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500">结构对比</div>
                    {cardStructureDiff.lines.map((line) => <div key={line} className="text-xs leading-5 text-slate-600 dark:text-slate-300">{line}</div>)}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-900/40 dark:bg-slate-950">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">当前</div>
                    {renderComponentPreview(activeComponent, theme, layout, currentCardChildren)}
                    <div className="mt-3 space-y-1">
                      {propDiffEntries.slice(0, 8).map((entry) => (
                        <div key={`current-${entry.key}`} className={`grid grid-cols-[90px_1fr] items-start gap-2 rounded-lg px-2 py-1.5 text-[10px] ${entry.changed ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200' : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}>
                          <div className="truncate font-semibold">{entry.key}</div>
                          <div className="truncate">{formatDiffValue(entry.before)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-purple-200 bg-white p-4 dark:border-purple-900/40 dark:bg-slate-950">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-purple-500">方案</div>
                    {renderLocalCandidatePreview(activeComponent, candidate, theme, layout)}
                    <div className="mt-3 space-y-1">
                      {propDiffEntries.slice(0, 8).map((entry) => (
                        <div key={`candidate-${entry.key}`} className={`grid grid-cols-[90px_1fr] items-start gap-2 rounded-lg px-2 py-1.5 text-[10px] ${entry.changed ? 'bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200' : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}>
                          <div className="truncate font-semibold">{entry.key}</div>
                          <div className="truncate">{formatDiffValue(entry.after)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              renderLocalCandidatePreview(activeComponent, candidate, theme, layout)
            )}
          </div>
          <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">变化摘要</div>
            {getCandidateDiffSummary(activeComponent, candidate, currentCardChildren.length).map((line) => <div key={line} className="text-xs leading-5 text-slate-600 dark:text-slate-300">{line}</div>)}
          </div>
          <div className="mt-4 space-y-2 rounded-2xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-900/40 dark:bg-purple-900/20">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500">继续优化这个方案</div>
            <textarea value={candidateFollowupPrompt} onChange={(e) => setCandidateFollowupPrompt(e.target.value)} disabled={candidateFollowupLoading} placeholder="例如：这个方案再简洁一点，按钮文案更短" className="min-h-[72px] w-full resize-y rounded-md border border-purple-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-purple-500 dark:border-purple-900/40 dark:bg-slate-900 dark:text-slate-200" />
            <button type="button" onClick={handleFollowupRefine} disabled={candidateFollowupLoading || !candidateFollowupPrompt.trim()} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-purple-700 disabled:opacity-50">
              {candidateFollowupLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {candidateFollowupLoading ? '优化中...' : '继续优化'}
            </button>
            {candidateFollowupError && <div className="text-[10px] text-red-500">{candidateFollowupError}</div>}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            props {Object.keys(candidate.targetProps || {}).length} 项
            {activeComponent.type === 'Card' && candidate.children ? `，子组件 ${candidate.children.length} 个` : ''}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPreviewCandidateIndex(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">关闭</button>
            <button type="button" onClick={() => applyLocalCandidate(candidate)} className="rounded-xl bg-purple-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-purple-700">应用</button>
          </div>
        </div>
      </div>
    </div>
  );
};