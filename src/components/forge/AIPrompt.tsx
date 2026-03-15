import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Send, Loader2, Sparkles, Wand2, RotateCcw } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { fetchAI } from '@/lib/ai';
import { COMPONENT_REGISTRY } from '@/config/components';
import { generateId } from '@/lib/utils';
import { AIGeneratedComponent, ComponentItem, PropSchema } from '@/types';

type RegistryEntry = typeof COMPONENT_REGISTRY[string];

interface LLMComponentSchema {
  type: string;
  name: string;
  category: string;
  availableProps: string[];
  propSchema: Record<string, PropSchema>;
}

type AIGenerationLanguage = 'zh-CN' | 'en-US';

const LANGUAGE_OPTIONS: Array<{
  value: AIGenerationLanguage;
  label: string;
  promptLabel: string;
  example: string;
}> = [
  {
    value: 'zh-CN',
    label: '中文',
    promptLabel: '简体中文',
    example: '[{"type":"Badge","props":{"text":"欢迎回来","variant":"secondary"}},{"type":"Card","props":{"title":"登录到工作台","description":"输入账号信息后继续"}},{"type":"Input","props":{"placeholder":"邮箱地址","type":"email"}},{"type":"Input","props":{"placeholder":"密码","type":"password"}},{"type":"Checkbox","props":{"label":"记住我","checked":true}},{"type":"Button","props":{"children":"立即登录","variant":"default","size":"default"}},{"type":"Separator","props":{"orientation":"horizontal"}},{"type":"Button","props":{"children":"使用短信验证码登录","variant":"outline","size":"default"}}]'
  },
  {
    value: 'en-US',
    label: 'English',
    promptLabel: 'English',
    example: '[{"type":"Badge","props":{"text":"Welcome back","variant":"secondary"}},{"type":"Card","props":{"title":"Sign in to your workspace","description":"Enter your account details to continue"}},{"type":"Input","props":{"placeholder":"Email address","type":"email"}},{"type":"Input","props":{"placeholder":"Password","type":"password"}},{"type":"Checkbox","props":{"label":"Remember me","checked":true}},{"type":"Button","props":{"children":"Sign in now","variant":"default","size":"default"}},{"type":"Separator","props":{"orientation":"horizontal"}},{"type":"Button","props":{"children":"Use magic code instead","variant":"outline","size":"default"}}]'
  }
];

const inferExplicitComponentCount = (prompt: string): number | null => {
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

const inferComponentBudget = (prompt: string) => {
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

const summarizeThemeContext = (theme: ReturnType<typeof useForgeStore.getState>['theme']): string => {
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

const inferPromptComponentHints = (prompt: string): string[] => {
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

const applyVisualHierarchy = (items: ComponentItem[]): ComponentItem[] => {
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

const inferGenerationMode = (prompt: string): 'append' | 'replace' => {
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

const summarizeCanvasContext = (items: ComponentItem[]): string => {
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

const formatRecentAISession = (
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

const normalizeGeneratedComponents = (raw: string): AIGeneratedComponent[] => {
  const payload = extractJsonPayload(raw);
  const parsed = JSON.parse(payload) as AIGeneratedComponent[] | { components?: AIGeneratedComponent[] };

  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.components)) return parsed.components;

  throw new Error('AI 返回的 JSON 结构不符合要求');
};

const sanitizeGeneratedItems = (raw: string, hardLimit: number): ComponentItem[] => {
  const parsedItems = normalizeGeneratedComponents(raw).slice(0, hardLimit);
  return parsedItems
    .map(sanitizeGeneratedItem)
    .filter((item): item is ComponentItem => item !== null);
};

const smartNestItemsIntoCard = (items: ComponentItem[], prompt: string): ComponentItem[] => {
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

const buildRepairPrompt = (raw: string, schemaForLLM: LLMComponentSchema[]): string => {
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

const sanitizeGeneratedItem = (item: AIGeneratedComponent): ComponentItem | null => {
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

const buildSchemaForLLM = (): LLMComponentSchema[] =>
  Object.entries(COMPONENT_REGISTRY).map(([type, config]) => ({
    type,
    name: config.name,
    category: config.category,
    availableProps: Object.keys(config.defaultProps),
    propSchema: config.propSchema || {}
  }));

const getUserFacingError = (error: unknown): string => {
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

export const AIPrompt: React.FC = () => {
  const { layout, theme, canvasItems, appendComponents, clearCanvas, aiSessionLog, appendAISessionEntry, clearAISessionLog } = useForgeStore();
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
      const languageConfig = LANGUAGE_OPTIONS.find((option) => option.value === generationLanguage) || LANGUAGE_OPTIONS[0];
      const componentBudget = inferComponentBudget(aiPromptText);
      const generationMode = inferGenerationMode(aiPromptText);
      const canvasContext = summarizeCanvasContext(canvasItems);
      const themeContext = summarizeThemeContext(theme);
      const hintedTypes = inferPromptComponentHints(aiPromptText);
      const aiSessionContext = formatRecentAISession(aiSessionLog);
      const sysPrompt = [
        '你是一个专业的无代码 UI 工程师。',
        '你的任务是根据用户描述，生成一个由现有组件组成的界面草图。',
        `所有面向最终用户的文案必须使用 ${languageConfig.promptLabel}，除非用户明确要求其他语言。`,
        '你只能使用下面 schema 中存在的组件 type，并且 props 只能使用 availableProps 或 propSchema 中定义的字段。',
        '输出必须是严格合法的 JSON 数组，不要返回 Markdown、注释、解释或代码块。',
        '每个数组元素格式必须是 {"type": string, "props": object}。',
        `组件数量策略：优先在 ${componentBudget.min} 到 ${componentBudget.max} 个范围内，但可根据需求复杂度动态增减，最大不超过 ${componentBudget.hardLimit}。`,
        componentBudget.preferredCountHint,
        '如果是登录、注册、表单、结算、后台等界面，优先补齐标题、说明、输入项、状态项、分隔元素和次级操作。',
        '除非用户明确要求极简，否则尽量让结构更丰富一些。',
        hintedTypes.length > 0
          ? `用户提示词明显指向这些组件类型，优先覆盖：${hintedTypes.join(', ')}。`
          : '若用户提示词未明确组件类型，请按场景自动选择最合适的组件组合。',
        generationMode === 'append'
          ? '生成结果应与当前画布兼容，尽量补充而不是重复已有结构。'
          : '用户希望重做当前画布，请生成一套完整可替换的新结构。',
        `最近会话上下文（用于保持连续风格和意图）：\n${aiSessionContext}`,
        `当前画布上下文：${canvasContext}`,
        `当前主题设计 token：${themeContext}`,
        '视觉层级规则：每个核心区域只保留一个主操作按钮（Button variant=default），次要动作使用 outline 或 secondary，危险动作使用 destructive。',
        '文案层级规则：标题短而明确，描述用于解释下一步，按钮文案使用动词开头，提示文案简洁且可执行。',
        '色彩一致性规则：强调信息（如主按钮/关键状态）优先对应 primary 语义，说明信息优先对应 muted 语义。',
        '字段约束：Button 文本放到 children；Card 文本放到 title 和 description；Badge 文本放到 text；Alert 文本放到 title 和 description。',
        `当前可用组件 schema：${JSON.stringify(schemaForLLM)}`,
        `示例输出：${languageConfig.example}`
      ].join('\n');

      const jsonStr = await fetchAI(aiPromptText, sysPrompt, 'application/json');
      if (!jsonStr) throw new Error('空响应');

      let validItems: ComponentItem[] = [];
      try {
        validItems = sanitizeGeneratedItems(jsonStr, componentBudget.hardLimit);
      } catch {
        const repaired = await fetchAI(
          buildRepairPrompt(jsonStr, schemaForLLM),
          '你是严格的 JSON 修复器，只输出合法 JSON 数组。',
          'application/json'
        );
        validItems = sanitizeGeneratedItems(repaired, componentBudget.hardLimit);
      }

      validItems = smartNestItemsIntoCard(validItems, aiPromptText);
      validItems = applyVisualHierarchy(validItems);

      if (validItems.length > 0) {
        if (generationMode === 'replace') {
          clearCanvas();
        }
        appendComponents(validItems);
        appendAISessionEntry({
          scope: 'page',
          prompt: aiPromptText,
          resultSummary: `生成 ${validItems.length} 个组件（模式：${generationMode}）`
        });
        setAiPromptText('');
        setShowAiPrompt(false);
      } else {
        throw new Error('AI 没有生成可用组件，请换个更具体的描述重试。');
      }
    } catch (err) {
      console.error(err);
      setAiError(getUserFacingError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  // AI 输入展开区（使用 Portal 渲染到外部）
  const inputArea = (
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
          placeholder="描述想要生成的界面，例如：生成一个登录卡片，包含用户名输入框、密码输入框和登录按钮..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400"
          disabled={isGenerating}
        />
        <button
          type="button"
          onClick={() => {
            if (aiSessionLog.length === 0) return;
            if (window.confirm('确认清空 AI 会话上下文吗？清空后将不再继承最近对话意图。')) {
              clearAISessionLog();
            }
          }}
          disabled={isGenerating || aiSessionLog.length === 0}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
          title="清空 AI 会话上下文"
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

  return (
    <>
      {/* AI 智能构建按钮 */}
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

      {/* 使用 Portal 将输入区渲染到 body，但保持在组件内管理 */}
      {typeof window !== 'undefined' && createPortal(
        inputArea,
        document.getElementById('ai-prompt-portal') || document.body
      )}
    </>
  );
};