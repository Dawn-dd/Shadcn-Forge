import { useState } from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { fetchAI } from '@/lib/ai';
import { ComponentItem } from '@/types';
import { AIGenerationLanguage, LANGUAGE_OPTIONS } from '../types';
import {
  buildSchemaForLLM, inferComponentBudget, inferGenerationMode,
  summarizeCanvasContext, summarizeThemeContext, inferPromptComponentHints,
  formatRecentAISession, sanitizeGeneratedItems, buildRepairPrompt,
  smartNestItemsIntoCard, applyVisualHierarchy, getUserFacingError
} from '../utils';

export const useAIPrompt = () => {
  const { theme, canvasItems, appendComponents, clearCanvas, aiSessionLog, appendAISessionEntry } = useForgeStore();
  
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [generationLanguage, setGenerationLanguage] = useState<AIGenerationLanguage>('zh-CN');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIGenerate = async () => {
    if (!aiPromptText.trim()) return;
    setIsGenerating(true);
    setAiError(null);
    
    try {
      const schemaForLLM = buildSchemaForLLM();
      const languageConfig = LANGUAGE_OPTIONS.find((opt) => opt.value === generationLanguage) || LANGUAGE_OPTIONS[0];
      const budget = inferComponentBudget(aiPromptText);
      const mode = inferGenerationMode(aiPromptText);
      const hints = inferPromptComponentHints(aiPromptText);
      
      const sysPrompt = [
        '你是一个专业的无代码 UI 工程师。',
        `所有面向最终用户的文案必须使用 ${languageConfig.promptLabel}。`,
        '只能使用下面 schema 中存在的组件 type，输出严格合法的 JSON 数组，格式为 {"type": string, "props": object}。',
        `数量策略：${budget.min} 到 ${budget.max} 个范围内，最大 ${budget.hardLimit}。${budget.preferredCountHint}`,
        hints.length > 0 ? `优先覆盖这些组件：${hints.join(', ')}。` : '',
        mode === 'append' ? '生成结果应与当前画布兼容，补充而非重复。' : '生成一套完整可替换的新结构。',
        `最近会话上下文：\n${formatRecentAISession(aiSessionLog)}`,
        `当前画布：${summarizeCanvasContext(canvasItems)}`,
        `当前主题：${summarizeThemeContext(theme)}`,
        '视觉与文案规则：一个主按钮(default)，次要(outline/secondary)；标题明确，按钮动词开头。',
        `可用 schema：${JSON.stringify(schemaForLLM)}`,
        `示例输出：${languageConfig.example}`
      ].filter(Boolean).join('\n');

      const jsonStr = await fetchAI(aiPromptText, sysPrompt, 'application/json');
      if (!jsonStr) throw new Error('空响应');

      let validItems: ComponentItem[] = [];
      try {
        validItems = sanitizeGeneratedItems(jsonStr, budget.hardLimit);
      } catch {
        const repaired = await fetchAI(buildRepairPrompt(jsonStr, schemaForLLM), '你是严格的 JSON 修复器，只输出合法 JSON 数组。', 'application/json');
        validItems = sanitizeGeneratedItems(repaired, budget.hardLimit);
      }

      validItems = applyVisualHierarchy(smartNestItemsIntoCard(validItems, aiPromptText));

      if (validItems.length > 0) {
        if (mode === 'replace') clearCanvas();
        appendComponents(validItems);
        appendAISessionEntry({ scope: 'page', prompt: aiPromptText, resultSummary: `生成 ${validItems.length} 个组件（模式：${mode}）` });
        setAiPromptText('');
        setShowAiPrompt(false);
      } else {
        throw new Error('AI 没有生成可用组件，请换个更具体的描述重试。');
      }
    } catch (err) {
      setAiError(getUserFacingError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    showAiPrompt, setShowAiPrompt,
    aiPromptText, setAiPromptText,
    generationLanguage, setGenerationLanguage,
    isGenerating, aiError,
    handleAIGenerate
  };
};