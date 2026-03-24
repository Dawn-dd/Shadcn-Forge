/**
 * 组件渲染和属性处理相关的工具函数集合
 */
import { COMPONENT_REGISTRY } from '@/config/components';
import { ComponentItem, PropSchema, AIGeneratedComponent, Theme, Layout } from '@/types';
import { generateId } from '@/lib/utils';
import { LocalRewriteCandidate, LocalRewritePayload, PropDiffEntry } from './types';

/**
 * 预览组件的缩放比例
 */
export const PREVIEW_SCALE = 0.62;

/**
 * 为LLM构建组件schema信息
 * @returns 返回组件类型、名称、可用属性和属性schema的数组
 */
export const buildSchemaForLLM = () =>
  Object.entries(COMPONENT_REGISTRY).map(([type, config]) => ({
    type,
    name: config.name,
    availableProps: Object.keys(config.defaultProps),
    propSchema: config.propSchema || {}
  }));

export const parseBoolean = (value: unknown, fallback: boolean): boolean => { //该函数用于将未知类型的值转换为布尔值，如果无法转换则返回指定的默认值。
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
};

  //该函数用于根据给定的 schema 规范对输入值进行清理和规范化，确保返回的值符合预期的类型和范围约束。如果输入值无效，则返回回退值。
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

// 该函数根据组件类型和原始属性，返回一个经过处理的属性对象，确保每个属性值都符合组件的默认值和属性规范。
export const sanitizePropsForType = (type: string, rawProps: Record<string, unknown> | undefined) => {
  const config = COMPONENT_REGISTRY[type];
  return Object.entries(config.defaultProps).reduce<Record<string, unknown>>((acc, [key, defaultValue]) => {
    acc[key] = sanitizePropValue(rawProps?.[key], defaultValue, config.propSchema?.[key]);
    return acc;
  }, {});
};

// 该函数用于处理和清理AI生成的组件子元素，将其转换为标准化的组件项。
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

// 该函数用于规范化本地重写候选对象，根据输入参数的类型返回相应的候选对象数组。
export const normalizeLocalRewriteCandidates = (payload: LocalRewritePayload): LocalRewriteCandidate[] => {
  if (Array.isArray(payload.candidates)) return payload.candidates.slice(0, 2);
  return [{ summary: payload.summary, targetProps: payload.targetProps, children: payload.children }];
};

// 格式化最近的AI对话会话记录，将其转换为可读的字符串形式。
export const formatRecentAISession = (entries: { scope: string; prompt: string; resultSummary: string }[], limit: number = 5) => {
  const recent = entries.slice(-limit);
  if (recent.length === 0) return '无历史对话。';
  return recent.map((entry, index) => `${index + 1}. [${entry.scope}] ${entry.prompt} -> ${entry.resultSummary}`).join('\n');
};

// 该函数用于渲染本地候选预览，根据活动组件、候选内容、主题和布局信息生成预览视图。
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

// 根据组件类型、主题和布局配置渲染组件预览，支持嵌套子组件渲染。
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

// 该函数用于将任意类型的值转换为字符串表示形式，针对不同类型的值提供特定的格式化处理。
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

// 该函数用于比较两个组件属性之间的差异，并返回一个包含所有属性差异的数组，数组按照属性是否被修改进行排序。
export const getPropDiffEntries = (activeComponent: ComponentItem, candidate: LocalRewriteCandidate): PropDiffEntry[] => {
  const nextProps = sanitizePropsForType(activeComponent.type, candidate.targetProps);
  const keys = Array.from(new Set([...Object.keys(activeComponent.props), ...Object.keys(nextProps)]));
  return keys
    .map((key) => ({ key, before: activeComponent.props[key], after: nextProps[key], changed: activeComponent.props[key] !== nextProps[key] }))
    .sort((a, b) => Number(b.changed) - Number(a.changed));
};

// 比较当前组件列表与候选组件列表的结构差异，并返回变化结果。
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

// 该函数用于获取组件差异的摘要信息，主要比较当前组件属性与候选重写目标属性的变更，并生成优化摘要。
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