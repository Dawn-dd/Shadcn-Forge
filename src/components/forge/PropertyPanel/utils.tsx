import { COMPONENT_REGISTRY } from '@/config/components';
import { ComponentItem, PropSchema, AIGeneratedComponent, Theme, Layout } from '@/types';
import { generateId } from '@/lib/utils';
import { LocalRewriteCandidate, LocalRewritePayload, PropDiffEntry } from './types';

export const PREVIEW_SCALE = 0.62;

export const buildSchemaForLLM = () =>
  Object.entries(COMPONENT_REGISTRY).map(([type, config]) => ({
    type,
    name: config.name,
    availableProps: Object.keys(config.defaultProps),
    propSchema: config.propSchema || {}
  }));

export const parseBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
};

export const sanitizePropValue = (value: unknown, fallback: unknown, schema?: PropSchema): unknown => {
  if (value === undefined || value === null) return fallback;
  if (schema?.type === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return fallback;
    if (schema.min !== undefined && num < schema.min) return schema.min;
    if (schema.max !== undefined && num > schema.max) return schema.max;
    return num;
  }
  if (schema?.type === 'boolean') return parseBoolean(value, typeof fallback === 'boolean' ? fallback : false);
  if (schema?.type === 'select') {
    if (schema.options?.includes(value as never)) return value;
    return fallback;
  }
  if (schema?.type === 'string') return typeof value === 'string' ? value : String(value);
  if (typeof fallback === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : fallback;
  }
  if (typeof fallback === 'boolean') return parseBoolean(value, fallback);
  if (typeof fallback === 'string') return typeof value === 'string' ? value : String(value);
  return value;
};

export const sanitizePropsForType = (type: string, rawProps: Record<string, unknown> | undefined) => {
  const config = COMPONENT_REGISTRY[type];
  return Object.entries(config.defaultProps).reduce<Record<string, unknown>>((acc, [key, defaultValue]) => {
    acc[key] = sanitizePropValue(rawProps?.[key], defaultValue, config.propSchema?.[key]);
    return acc;
  }, {});
};

export const sanitizeChildren = (children: AIGeneratedComponent[] | undefined, parentId: string): ComponentItem[] => {
  if (!children) return [];
  return children.flatMap((child) => {
    const config = COMPONENT_REGISTRY[child.type];
    if (!config) return [];
    return [{
      id: generateId(),
      type: child.type,
      parentId,
      props: sanitizePropsForType(child.type, child.props)
    }];
  });
};

export const normalizeLocalRewriteCandidates = (payload: LocalRewritePayload): LocalRewriteCandidate[] => {
  if (Array.isArray(payload.candidates)) return payload.candidates.slice(0, 2);
  return [{ summary: payload.summary, targetProps: payload.targetProps, children: payload.children }];
};

export const formatRecentAISession = (entries: { scope: string; prompt: string; resultSummary: string }[], limit: number = 5) => {
  const recent = entries.slice(-limit);
  if (recent.length === 0) return '无历史对话。';
  return recent.map((entry, index) => `${index + 1}. [${entry.scope}] ${entry.prompt} -> ${entry.resultSummary}`).join('\n');
};

export const renderLocalCandidatePreview = (activeComponent: ComponentItem, candidate: LocalRewriteCandidate, theme: Theme, layout: Layout) => {
  const config = COMPONENT_REGISTRY[activeComponent.type];
  if (!config) return null;
  const previewItem: ComponentItem = { ...activeComponent, props: sanitizePropsForType(activeComponent.type, candidate.targetProps) };
  const previewLayout: Layout = { ...layout, gap: 12, padding: 16 };

  if (activeComponent.type === 'Card') {
    const childItems = sanitizeChildren(candidate.children, previewItem.id);
    const childNodes = childItems.map((child) => {
      const childConfig = COMPONENT_REGISTRY[child.type];
      if (!childConfig) return null;
      return <div key={child.id} className="w-full">{childConfig.render(child.props, theme, previewLayout, child)}</div>;
    });
    return config.render({ ...previewItem.props, __children: childNodes }, theme, previewLayout, previewItem);
  }
  return config.render(previewItem.props, theme, previewLayout, previewItem);
};

export const renderComponentPreview = (component: ComponentItem, theme: Theme, layout: Layout, children?: ComponentItem[]) => {
  const config = COMPONENT_REGISTRY[component.type];
  if (!config) return null;
  const previewLayout: Layout = { ...layout, gap: 12, padding: 16 };

  if (component.type === 'Card') {
    const childNodes = (children ?? []).map((child) => {
      const childConfig = COMPONENT_REGISTRY[child.type];
      if (!childConfig) return null;
      return <div key={child.id} className="w-full">{childConfig.render(child.props, theme, previewLayout, child)}</div>;
    });
    return config.render({ ...component.props, __children: childNodes }, theme, previewLayout, component);
  }
  return config.render(component.props, theme, previewLayout, component);
};

export const formatDiffValue = (value: unknown): string => {
  if (value === undefined) return '未设置';
  if (value === null) return 'null';
  if (typeof value === 'string') return value || '空字符串';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    const serialized = JSON.stringify(value);
    return serialized.length > 80 ? `${serialized.slice(0, 80)}...` : serialized;
  } catch {
    return String(value);
  }
};

export const getPropDiffEntries = (activeComponent: ComponentItem, candidate: LocalRewriteCandidate): PropDiffEntry[] => {
  const nextProps = sanitizePropsForType(activeComponent.type, candidate.targetProps);
  const keys = Array.from(new Set([...Object.keys(activeComponent.props), ...Object.keys(nextProps)]));
  return keys
    .map((key) => ({ key, before: activeComponent.props[key], after: nextProps[key], changed: activeComponent.props[key] !== nextProps[key] }))
    .sort((a, b) => Number(b.changed) - Number(a.changed));
};

export const getCardStructureDiff = (currentChildren: ComponentItem[], candidateChildren?: AIGeneratedComponent[]) => {
  if (!candidateChildren) return { changed: false, lines: ['未调整子组件结构'] };
  const currentTypes = currentChildren.map((child) => child.type);
  const nextTypes = candidateChildren.map((child) => child.type);
  const lines: string[] = [];

  if (currentTypes.length !== nextTypes.length) lines.push(`数量：${currentTypes.length} → ${nextTypes.length}`);
  const currentTypeSet = new Set(currentTypes);
  const nextTypeSet = new Set(nextTypes);
  const addedTypes = Array.from(nextTypeSet).filter((type) => !currentTypeSet.has(type));
  const removedTypes = Array.from(currentTypeSet).filter((type) => !nextTypeSet.has(type));

  if (addedTypes.length > 0) lines.push(`新增类型：${addedTypes.join('、')}`);
  if (removedTypes.length > 0) lines.push(`移除类型：${removedTypes.join('、')}`);
  if (lines.length === 0) lines.push('结构无明显变化（可能仅调整了 props）');

  return { changed: lines.some((line) => !line.includes('无明显变化') && !line.includes('未调整')), lines };
};

export const getCandidateDiffSummary = (activeComponent: ComponentItem, candidate: LocalRewriteCandidate, currentChildCount: number = 0): string[] => {
  const nextProps = sanitizePropsForType(activeComponent.type, candidate.targetProps);
  const changedKeys = Object.keys(nextProps).filter((key) => activeComponent.props[key] !== nextProps[key]);
  const summary: string[] = [];

  if (changedKeys.length > 0) summary.push(`调整 props：${changedKeys.slice(0, 4).join('、')}${changedKeys.length > 4 ? ' 等' : ''}`);
  if (activeComponent.type === 'Card') {
    const nextChildCount = candidate.children?.length ?? 0;
    if (candidate.children && nextChildCount !== currentChildCount) summary.push(`重构子组件：${nextChildCount} 个`);
    if (candidate.children && nextChildCount > 0) {
      const childTypes = candidate.children.slice(0, 4).map((child) => child.type).join('、');
      summary.push(`新增结构：${childTypes}${nextChildCount > 4 ? ' 等' : ''}`);
    }
  }
  if (summary.length === 0) summary.push('主要优化了文案语气和信息表达。');
  return summary.slice(0, 3);
};