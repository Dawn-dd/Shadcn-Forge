import { Wand2 } from 'lucide-react';
import { useAIPrompt } from './hooks/useAIPrompt';
import { AIPromptInputArea } from './components/InputArea';

export const AIPrompt: React.FC = () => {
  const aiState = useAIPrompt();
  const { showAiPrompt, setShowAiPrompt, isGenerating } = aiState;

  return (
    <>
      <button 
        onClick={() => setShowAiPrompt(!showAiPrompt)}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md border ${
          showAiPrompt 
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700/50 ring-2 ring-purple-500/20' 
            : 'bg-white dark:bg-slate-800 text-purple-500 border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700'
        }`}
      >
        <Wand2 size={14} className={isGenerating ? "animate-pulse" : ""} /> 
        <span className="hidden sm:inline">AI 智能构建</span>
      </button>

      <AIPromptInputArea aiState={aiState} />
    </>
  );
};