import { useState, useEffect } from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { fetchAI } from '@/lib/ai';
import { ComponentItem } from '@/types';
import { LocalRewriteMode, LocalRewriteCandidate, LocalRewritePayload } from '../types';
import { buildSchemaForLLM, formatRecentAISession, normalizeLocalRewriteCandidates, sanitizePropsForType, sanitizeChildren } from '../utils';

export const useLocalAIRewrite = (activeComponent: ComponentItem | undefined) => {
  const { theme, aiSessionLog, appendAISessionEntry, replaceComponentProps, replaceCardChildren } = useForgeStore();

  const [localAiPrompt, setLocalAiPrompt] = useState('');
  const [localAiLoading, setLocalAiLoading] = useState(false);
  const [localAiError, setLocalAiError] = useState<string | null>(null);
  const [localAiExpanded, setLocalAiExpanded] = useState(false);
  const [localAiMode, setLocalAiMode] = useState<LocalRewriteMode>('both');
  const [localAiCandidates, setLocalAiCandidates] = useState<LocalRewriteCandidate[]>([]);
  const [focusedCandidateIndex, setFocusedCandidateIndex] = useState<number | null>(null);
  const [previewCandidateIndex, setPreviewCandidateIndex] = useState<number | null>(null);
  const [previewCompareMode, setPreviewCompareMode] = useState(false);
  const [candidateFollowupPrompt, setCandidateFollowupPrompt] = useState('');
  const [candidateFollowupLoading, setCandidateFollowupLoading] = useState(false);
  const [candidateFollowupError, setCandidateFollowupError] = useState<string | null>(null);

  useEffect(() => {
    setLocalAiPrompt('');
    setLocalAiError(null);
    setLocalAiCandidates([]);
    setLocalAiExpanded(false);
    setLocalAiMode('both');
    setFocusedCandidateIndex(null);
    setPreviewCandidateIndex(null);
    setPreviewCompareMode(false);
    setCandidateFollowupPrompt('');
    setCandidateFollowupError(null);
  }, [activeComponent?.id]);

  useEffect(() => {
    setPreviewCompareMode(false);
    setCandidateFollowupPrompt('');
    setCandidateFollowupError(null);
  }, [previewCandidateIndex]);

  const applyLocalCandidate = (candidate: LocalRewriteCandidate) => {
    if (!activeComponent) return;
    const targetProps = sanitizePropsForType(activeComponent.type, candidate.targetProps);

    if (activeComponent.type === 'Card') {
      if (candidate.children) {
        const nextChildren = sanitizeChildren(candidate.children, activeComponent.id);
        replaceCardChildren(activeComponent.id, targetProps, nextChildren);
      } else {
        replaceComponentProps(activeComponent.id, targetProps);
      }
    } else {
      replaceComponentProps(activeComponent.id, targetProps);
    }
    setLocalAiCandidates([]);
    setLocalAiPrompt('');
    setFocusedCandidateIndex(null);
    setPreviewCandidateIndex(null);
  };

  const handleLocalAIRewrite = async () => {
    if (!activeComponent || !localAiPrompt.trim()) return;
    setLocalAiLoading(true);
    setLocalAiError(null);
    setLocalAiCandidates([]);

    try {
      const schemaForLLM = buildSchemaForLLM();
      const componentSchema = COMPONENT_REGISTRY[activeComponent.type];
      const promptMode = activeComponent.type === 'Card' ? 'card' : 'component';
      const aiSessionContext = formatRecentAISession(aiSessionLog);
      const modeInstruction =
        localAiMode === 'copy'
          ? '本次只优化文案与语义表达，尽量保持当前结构不变。除非必要，不要调整 children。'
          : localAiMode === 'structure'
            ? '本次重点优化结构与层级，可以调整 variant、size、字段组合；若当前是 Card，可改写 children 结构，但文案保持简洁。'
            : '本次同时优化文案与结构，允许调整 props 和 children，使结果更完整。';
      
      const sysPrompt = [
        '你是一个专业的 UI 局部改写助手。',
        '你只重写当前选中的单个组件或卡片，不要生成整页。',
        '你必须生成 2 个不同方向但都合理的候选方案。',
        `当前主题色：primary=${theme.primary}, secondary=${theme.secondary}, background=${theme.background}, foreground=${theme.foreground}。`,
        `当前选中组件类型：${activeComponent.type}。`,
        `当前组件默认 props schema：${JSON.stringify({ type: activeComponent.type, availableProps: Object.keys(componentSchema.defaultProps), propSchema: componentSchema.propSchema || {} })}`,
        promptMode === 'card'
          ? '输出必须是严格 JSON 对象，格式为 {"candidates": [{"summary": string, "targetProps": object, "children": [{"type": string, "props": object}]?}, {...}] }。children 表示卡片内的新子组件。'
          : '输出必须是严格 JSON 对象，格式为 {"candidates": [{"summary": string, "targetProps": object}, {...}] }。不要包含 children。',
        `最近会话上下文（用于保持连续意图）：\n${aiSessionContext}`,
        '每个 summary 必须是一句短说明，用来区分两个候选方案。',
        modeInstruction,
        '如果用户没有要求修改某些属性，可以保持语义上合理即可。',
        '文案要更专业、统一、简洁，按钮和说明文字要有主次层级。',
        `所有可用组件 schema：${JSON.stringify(schemaForLLM)}`
      ].join('\n');

      const raw = await fetchAI(localAiPrompt, sysPrompt, 'application/json');
      const parsed = JSON.parse(raw) as LocalRewritePayload;

      const candidates = normalizeLocalRewriteCandidates(parsed)
        .map((candidate) => ({
          summary: candidate.summary,
          targetProps: sanitizePropsForType(activeComponent.type, candidate.targetProps),
          children: candidate.children
        }))
        .filter((candidate) => Object.keys(candidate.targetProps || {}).length > 0)
        .slice(0, 2);

      if (candidates.length === 0) throw new Error('AI 没有生成可用候选方案，请换个更具体的描述重试。');

      setLocalAiCandidates(candidates);
      appendAISessionEntry({ scope: 'local', prompt: localAiPrompt, resultSummary: `生成 ${candidates.length} 个局部候选`, componentType: activeComponent.type });
    } catch (error) {
      console.error('Local AI rewrite failed', error);
      setLocalAiError(error instanceof Error ? error.message : '局部 AI 重构失败，请重试');
    } finally {
      setLocalAiLoading(false);
    }
  };

  const handleFollowupRefine = async () => {
    if (!activeComponent || previewCandidateIndex === null || !candidateFollowupPrompt.trim()) return;
    const baseCandidate = localAiCandidates[previewCandidateIndex];
    if (!baseCandidate) return;

    setCandidateFollowupLoading(true);
    setCandidateFollowupError(null);

    try {
      const componentSchema = COMPONENT_REGISTRY[activeComponent.type];
      const promptMode = activeComponent.type === 'Card' ? 'card' : 'component';
      const aiSessionContext = formatRecentAISession(aiSessionLog);
      const sysPrompt = [
        '你是一个专业的 UI 局部改写助手。',
        '你的任务是基于现有候选方案做一次微调，而不是重新生成完全无关的新方案。',
        `当前选中组件类型：${activeComponent.type}。`,
        `当前主题色：primary=${theme.primary}, secondary=${theme.secondary}, background=${theme.background}, foreground=${theme.foreground}。`,
        `当前组件默认 props schema：${JSON.stringify({ type: activeComponent.type, availableProps: Object.keys(componentSchema.defaultProps), propSchema: componentSchema.propSchema || {} })}`,
        `最近会话上下文（用于保持连续意图）：\n${aiSessionContext}`,
        `基准候选方案：${JSON.stringify(baseCandidate)}`,
        promptMode === 'card'
          ? '输出必须是严格 JSON 对象，格式为 {"summary": string, "targetProps": object, "children": [{"type": string, "props": object}]? }。'
          : '输出必须是严格 JSON 对象，格式为 {"summary": string, "targetProps": object }。不要包含 children。',
        '只返回 JSON，不要解释。'
      ].join('\n');

      const raw = await fetchAI(candidateFollowupPrompt, sysPrompt, 'application/json');
      const parsed = JSON.parse(raw) as LocalRewritePayload;
      const nextCandidateRaw = normalizeLocalRewriteCandidates(parsed)[0] ?? parsed;

      const nextCandidate: LocalRewriteCandidate = {
        summary: nextCandidateRaw.summary,
        targetProps: sanitizePropsForType(activeComponent.type, nextCandidateRaw.targetProps),
        children: nextCandidateRaw.children
      };

      setLocalAiCandidates((prev) => prev.map((candidate, index) => (index === previewCandidateIndex ? nextCandidate : candidate)));
      setFocusedCandidateIndex(previewCandidateIndex);
      appendAISessionEntry({ scope: 'local', prompt: candidateFollowupPrompt, resultSummary: `优化候选方案 ${previewCandidateIndex + 1}`, componentType: activeComponent.type });
      setCandidateFollowupPrompt('');
    } catch (error) {
      console.error('Candidate follow-up refine failed', error);
      setCandidateFollowupError(error instanceof Error ? error.message : '继续优化失败，请重试');
    } finally {
      setCandidateFollowupLoading(false);
    }
  };

  return {
    localAiPrompt, setLocalAiPrompt,
    localAiLoading, localAiError,
    localAiExpanded, setLocalAiExpanded,
    localAiMode, setLocalAiMode,
    localAiCandidates,
    focusedCandidateIndex, setFocusedCandidateIndex,
    previewCandidateIndex, setPreviewCandidateIndex,
    previewCompareMode, setPreviewCompareMode,
    candidateFollowupPrompt, setCandidateFollowupPrompt,
    candidateFollowupLoading, candidateFollowupError,
    handleLocalAIRewrite, handleFollowupRefine, applyLocalCandidate
  };
};