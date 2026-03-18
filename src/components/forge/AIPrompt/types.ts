import { PropSchema } from '@/types';
import { COMPONENT_REGISTRY } from '@/config/components';

export interface LLMComponentSchema {
  type: string;
  name: string;
  category: string;
  availableProps: string[];
  propSchema: Record<string, PropSchema>;
}
export type RegistryEntry = typeof COMPONENT_REGISTRY[string];

export type AIGenerationLanguage = 'zh-CN' | 'en-US';

export const LANGUAGE_OPTIONS: Array<{
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