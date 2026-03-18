import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { generateId } from '@/lib/utils';
import { AIGeneratedComponent, ComponentItem, PropSchema } from '@/types';
import { LLMComponentSchema, RegistryEntry } from './types';

export const inferExplicitComponentCount = (prompt: string): number | null => {
  const normalized = prompt.trim().toLowerCase();
  const patterns = [
    /(?:生成|做|给我|需要)\s*(\d{1,2})\s*(?:个|组)?\s*(?:组件|模块|控件)/i,
    /(?:exactly|about|around)?\s*(\d{1,2})\s*(?:components|widgets|blocks|items)/i
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > 0) {
      return Math.max(1, Math.min(30, value));
    }
  }

  return null;
};

export const inferComponentBudget = (prompt: string) => {
  const normalizedPrompt = prompt.trim().toLowerCase();
  const explicitCount = inferExplicitComponentCount(prompt);

  if (explicitCount !== null) {
    return {
      min: Math.max(1, explicitCount - 1),
      max: explicitCount + 1,
      hardLimit: Math.min(30, explicitCount + 3),
      preferredCountHint: `用户明确希望约 ${explicitCount} 个组件，优先贴近这个数量。`
    };
  }

  const complexKeywords = [
    '登录',
    '注册',
    '表单',
    '后台',
    '仪表盘',
    'dashboard',
    'login',
    'sign in',
    'sign-in',
    'signup',
    'sign up',
    'form',
    'checkout'
  ];

  const richKeywords = ['多一点', '丰富', '完整', '更多', 'detailed', 'detailed ui', 'richer', 'more components'];

  const wantsComplexLayout = complexKeywords.some((keyword) => normalizedPrompt.includes(keyword));
  const wantsRicherOutput = richKeywords.some((keyword) => normalizedPrompt.includes(keyword));

  if (wantsComplexLayout && wantsRicherOutput) {
    return {
      min: 10,
      max: 16,
      hardLimit: 22,
      preferredCountHint: '该需求偏复杂且希望更丰富，组件数量可以明显增加。'
    };
  }

  if (wantsComplexLayout) {
    return {
      min: 8,
      max: 14,
      hardLimit: 20,
      preferredCountHint: '该需求偏复杂，建议生成中等偏多组件。'
    };
  }

  if (wantsRicherOutput) {
    return {
      min: 7,
      max: 13,
      hardLimit: 18,
      preferredCountHint: '用户希望更丰富，建议增加信息层级和辅助组件。'
    };
  }

  return {
    min: 4,
    max: 10,
    hardLimit: 14,
    preferredCountHint: '若用户未指定数量，按需求复杂度自由决定组件数量。'
  };
};

export const summarizeThemeContext = (theme: ReturnType<typeof useForgeStore.getState>['theme']): string => {
  return [
    `primary=${theme.primary}`,
    `secondary=${theme.secondary}`,
    `background=${theme.background}`,
    `foreground=${theme.foreground}`,
    `muted=${theme.muted}`,
    `destructive=${theme.destructive}`,
    `radius=${theme.radius}px`,
    `borderWidth=${theme.borderWidth ?? 1}px`
  ].join(', ');
};

export const inferPromptComponentHints = (prompt: string): string[] => {
  const normalized = prompt.toLowerCase();
  const aliases: Array<{ type: string; keywords: string[] }> = [
    { type: 'Card', keywords: ['卡片', 'card'] },
    { type: 'Input', keywords: ['输入框', 'input', '邮箱', '密码', '手机号'] },
    { type: 'Button', keywords: ['按钮', 'button', '提交', '登录', '注册', '保存'] },
    { type: 'Checkbox', keywords: ['复选', 'checkbox', '记住我', '同意协议'] },
    { type: 'Select', keywords: ['下拉', 'select', '选择器'] },
    { type: 'Textarea', keywords: ['文本域', 'textarea', '备注', '描述'] },
    { type: 'Alert', keywords: ['提示', '告警', 'alert', 'warning'] },
    { type: 'Badge', keywords: ['标签', 'badge', '状态'] },
    { type: 'Tabs', keywords: ['tabs', '标签页', '选项卡'] },
    { type: 'Table', keywords: ['表格', 'table', '列表'] },
    { type: 'Progress', keywords: ['进度', 'progress'] },
    { type: 'Dialog', keywords: ['弹窗', 'dialog', 'modal'] },
    { type: 'DropdownMenu', keywords: ['菜单', 'dropdown'] },
    { type: 'Avatar', keywords: ['头像', 'avatar', '用户'] },
    { type: 'Separator', keywords: ['分隔', 'separator'] },
    { type: 'Switch', keywords: ['开关', 'switch'] }
  ];

  return aliases
    .filter((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))
    .map((entry) => entry.type);
};

export const applyVisualHierarchy = (items: ComponentItem[]): ComponentItem[] => {
  let primaryAssigned = false;

  return items.map((item) => {
    if (item.type !== 'Button') return item;

    const props = { ...item.props };
    const text = String(props.children ?? '').toLowerCase();
    const isSecondaryAction = /取消|返回|稍后|跳过|放弃|cancel|back|later|skip/.test(text);
    const isDangerAction = /删除|移除|危险|作废|delete|remove|danger/.test(text);

    if (isDangerAction) {
      props.variant = 'destructive';
    } else if (isSecondaryAction) {
      props.variant = 'outline';
    } else if (!primaryAssigned) {
      props.variant = 'default';
      primaryAssigned = true;
    } else if (props.variant === undefined || props.variant === 'default') {
      props.variant = 'secondary';
    }

    return { ...item, props };
  });
};

export const inferGenerationMode = (prompt: string): 'append' | 'replace' => {
  const normalizedPrompt = prompt.trim().toLowerCase();
  const replaceKeywords = [
    '重做',
    '重新做',
    '清空',
    '覆盖',
    '替换',
    '重置',
    'from scratch',
    'replace',
    'reset',
    'start over'
  ];

  return replaceKeywords.some((keyword) => normalizedPrompt.includes(keyword)) ? 'replace' : 'append';
};

export const summarizeCanvasContext = (items: ComponentItem[]): string => {
  if (items.length === 0) return '当前画布为空。';

  const topLevelCount = items.filter((item) => !item.parentId).length;
  const childCount = items.length - topLevelCount;
  const typeCounter = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const topTypes = Object.entries(typeCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([type, count]) => `${type}x${count}`)
    .join(', ');

  return `当前画布共有 ${items.length} 个组件（顶层 ${topLevelCount}，卡片子级 ${childCount}），主要类型：${topTypes || '无'}。`;
};

export const formatRecentAISession = (
  entries: ReturnType<typeof useForgeStore.getState>['aiSessionLog'],
  limit: number = 6
) => {
  const recent = entries.slice(-limit);
  if (recent.length === 0) return '无历史对话。';

  return recent
    .map((entry, index) => `${index + 1}. [${entry.scope}] ${entry.prompt} -> ${entry.resultSummary}`)
    .join('\n');
};

const extractJsonPayload = (raw: string): string => {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const arrayStart = withoutFence.indexOf('[');
  const arrayEnd = withoutFence.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return withoutFence.slice(arrayStart, arrayEnd + 1);
  }

  const objectStart = withoutFence.indexOf('{');
  const objectEnd = withoutFence.lastIndexOf('}');
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return withoutFence.slice(objectStart, objectEnd + 1);
  }

  return withoutFence;
};

const parseBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
};

const sanitizePropValue = (value: unknown, fallback: unknown, schema?: PropSchema): unknown => {
  if (value === undefined || value === null) return fallback;

  if (schema?.type === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return fallback;
    if (schema.min !== undefined && num < schema.min) return schema.min;
    if (schema.max !== undefined && num > schema.max) return schema.max;
    return num;
  }

  if (schema?.type === 'boolean') {
    return parseBoolean(value, typeof fallback === 'boolean' ? fallback : false);
  }

  if (schema?.type === 'select') {
    if (schema.options?.includes(value as never)) return value;
    return fallback;
  }

  if (schema?.type === 'string') {
    return typeof value === 'string' ? value : String(value);
  }

  if (typeof fallback === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  if (typeof fallback === 'boolean') {
    return parseBoolean(value, fallback);
  }

  if (typeof fallback === 'string') {
    return typeof value === 'string' ? value : String(value);
  }

  return value;
};

export const normalizeGeneratedComponents = (raw: string): AIGeneratedComponent[] => {
  const payload = extractJsonPayload(raw);
  const parsed = JSON.parse(payload) as AIGeneratedComponent[] | { components?: AIGeneratedComponent[] };

  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.components)) return parsed.components;

  throw new Error('AI 返回的 JSON 结构不符合要求');
};

export const sanitizeGeneratedItems = (raw: string, hardLimit: number): ComponentItem[] => {
  const parsedItems = normalizeGeneratedComponents(raw).slice(0, hardLimit);
  return parsedItems
    .map(sanitizeGeneratedItem)
    .filter((item): item is ComponentItem => item !== null);
};

export const smartNestItemsIntoCard = (items: ComponentItem[], prompt: string): ComponentItem[] => {
  if (items.length <= 2) return items;

  const normalizedPrompt = prompt.trim().toLowerCase();
  const wantsCardLayout = /卡片|card|登录|注册|表单|login|sign in|signup|form/.test(normalizedPrompt);
  if (!wantsCardLayout) return items;

  const cardItems = items.filter((item) => item.type === 'Card');
  if (cardItems.length !== 1) return items;

  const cardId = cardItems[0].id;
  const cardIndex = items.findIndex((item) => item.id === cardId);
  if (cardIndex === -1) return items;

  let nestedCount = 0;
  return items.map((item, index) => {
    if (index <= cardIndex) return item;
    if (item.type === 'Card') return item;

    // 限制自动归组数量，避免一次嵌套过深
    if (nestedCount >= 8) return item;

    nestedCount += 1;
    return { ...item, parentId: cardId };
  });
};

export const buildRepairPrompt = (raw: string, schemaForLLM: LLMComponentSchema[]): string => {
  const rawSnippet = raw.length > 4000 ? `${raw.slice(0, 4000)}\n...` : raw;

  return [
    '请把下面这段 AI 输出修复为严格合法 JSON。',
    '要求：只能输出 JSON 数组，不要 Markdown，不要解释。',
    '每个元素格式：{"type": string, "props": object}。',
    'type 必须来自以下 schema，props 只能使用对应组件的可用字段。',
    `组件 schema：${JSON.stringify(schemaForLLM)}`,
    `待修复内容：${rawSnippet}`
  ].join('\n');
};

export const sanitizeGeneratedItem = (item: AIGeneratedComponent): ComponentItem | null => {
  const config: RegistryEntry | undefined = COMPONENT_REGISTRY[item.type];
  if (!config) return null;

  const rawProps = item.props && typeof item.props === 'object' ? item.props : {};
  const nextProps = Object.entries(config.defaultProps).reduce<Record<string, unknown>>((acc, [key, defaultValue]) => {
    acc[key] = sanitizePropValue(
      (rawProps as Record<string, unknown>)[key],
      defaultValue,
      config.propSchema?.[key]
    );
    return acc;
  }, {});

  return {
    id: generateId(),
    type: item.type,
    props: nextProps
  };
};

export const buildSchemaForLLM = (): LLMComponentSchema[] =>
  Object.entries(COMPONENT_REGISTRY).map(([type, config]) => ({
    type,
    name: config.name,
    category: config.category,
    availableProps: Object.keys(config.defaultProps),
    propSchema: config.propSchema || {}
  }));

export const getUserFacingError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      return '未配置 AI 提供商的 API Key。请检查 .env 中的 AI_API_KEY 或对应平台的密钥配置。';
    }
    if (error.message.includes('免费额度已用尽') || error.message.includes('quota')) {
      return error.message;
    }
    if (error.message.includes('JSON')) {
      return 'AI 返回的数据格式不正确，请重试。';
    }
    return error.message;
  }

  return '网络错误或返回格式异常，请重试。';
};