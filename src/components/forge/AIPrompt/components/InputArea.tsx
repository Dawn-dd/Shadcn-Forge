import { createPortal } from 'react-dom';
import { Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { LANGUAGE_OPTIONS } from '../types';
import { useAIPrompt } from '../hooks/useAIPrompt';

interface AIPromptInputAreaProps {
  aiState: ReturnType<typeof useAIPrompt>;
}

export const AIPromptInputArea: React.FC<AIPromptInputAreaProps> = ({ aiState }) => {
  const { layout, aiSessionLog, clearAISessionLog } = useForgeStore();
  const {
    showAiPrompt, aiPromptText, setAiPromptText,
    generationLanguage, setGenerationLanguage,
    isGenerating, aiError, handleAIGenerate
  } = aiState;

  if (typeof window === 'undefined') return null;

  const content = (
    <div 
      className={`w-full border-b border-slate-200 dark:border-slate-800/60 shadow-lg transition-all duration-300 overflow-hidden z-10 ${
        showAiPrompt ? 'h-16 opacity-100' : 'h-0 opacity-0 border-transparent'
      }`} 
      style={{ backgroundColor: layout.appBg }}
    >
      <div className="flex items-center h-full px-6 max-w-4xl mx-auto gap-4">
        <Sparkles size={20} className="text-purple-500 shrink-0" />
        <div className="flex shrink-0 rounded-full border border-slate-200 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/80">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGenerationLanguage(option.value)}
              disabled={isGenerating}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                generationLanguage === option.value
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <input 
          type="text" 
          value={aiPromptText}
          onChange={(e) => setAiPromptText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAIGenerate(); }}
          placeholder="描述想要生成的界面，例如：生成一个登录卡片..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400"
          disabled={isGenerating}
        />
        <button
          type="button"
          onClick={() => {
            if (aiSessionLog.length > 0 && window.confirm('确认清空 AI 会话上下文吗？')) {
              clearAISessionLog();
            }
          }}
          disabled={isGenerating || aiSessionLog.length === 0}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCcw size={12} />
          上下文 {aiSessionLog.length}
        </button>
        <button 
          onClick={handleAIGenerate}
          disabled={isGenerating || !aiPromptText.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {isGenerating ? '正在思考并构建...' : '生成 UI'}
        </button>
      </div>
      {aiError && (
        <div className="absolute bottom-1 right-6 max-w-[60%] text-right text-[10px] text-red-500">
          {aiError}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.getElementById('ai-prompt-portal') || document.body);
};