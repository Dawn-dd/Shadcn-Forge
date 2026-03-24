/**
 * PropsForm组件：用于编辑和修改组件属性的表单界面
 * 支持多种类型的属性编辑，包括选择框、布尔值、数字、文本等
 * 集成了AI重写文本功能，可以优化文案内容
 */
import { useState } from 'react';  // 从React库中导入useState钩子
import { Loader2, Sparkles } from 'lucide-react';  // 从lucide-react库中导入Loader2和Sparkles图标
import { ComponentItem } from '@/types';  // 从types目录导入ComponentItem类型定义
import { COMPONENT_REGISTRY } from '@/config/components';  // 从config目录导入组件注册表
import { fetchAI } from '@/lib/ai';  // 从lib目录导入AI功能

// 定义PropsForm组件的属性接口
interface PropsFormProps {
  activeComponent: ComponentItem;    // 当前正在编辑的组件
  updateComponentProp: (id: string, key: string, value: unknown) => void;  // 更新组件属性的回调函数
}

/**
 * PropsForm组件：一个用于编辑组件属性的表单组件
 * @param {PropsFormProps} props - 组件的属性
 * @returns {JSX.Element} - 返回渲染的表单界面
 */
export const PropsForm: React.FC<PropsFormProps> = ({ activeComponent, updateComponentProp }) => {
  // 状态：当前正在AI重写的属性键
  const [rewritingKey, setRewritingKey] = useState<string | null>(null);

  // 处理AI重写文本的函数
  const handleAIRewrite = async (id: string, propKey: string, currentValue: unknown) => {
    if (!currentValue || typeof currentValue !== 'string') return;
    setRewritingKey(propKey);  // 设置正在重写的属性键
    try {
      const sysPrompt = '你是一个资深的UX文案专家。请将用户提供的UI文案重写得更加专业、自然、简练，适合用于现代Web应用。直接返回修改后的文本，不要带有任何引号或多余解释。';
      const newText = await fetchAI(currentValue, sysPrompt, 'text/plain');
      if (newText) updateComponentProp(id, propKey, newText.trim());
    } catch (err) {
      console.error('Rewrite failed', err);
    } finally {
      setRewritingKey(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 遍历当前组件的所有属性 */}
      {Object.entries(activeComponent.props).map(([propKey, propValue]) => {
        // 获取当前属性的schema定义
        const schema = COMPONENT_REGISTRY[activeComponent.type].propSchema?.[propKey];
        // 获取属性值的类型
        const valueType = typeof propValue;
        // 判断是否为字符串类型且不是特殊属性
        const isString = valueType === 'string' && propKey !== 'id' && propKey !== 'fallback';
        // 判断是否正在重写该属性
        const isRewriting = rewritingKey === propKey;

        // 处理选择类型的属性
        if (schema && schema.type === 'select' && schema.options) {
          return (
            <div key={propKey} className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{propKey}</label>
              <select
                value={String(propValue)}
                onChange={(e) => updateComponentProp(activeComponent.id, propKey, e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer appearance-none"
              >
                {schema.options.map((opt) => <option key={String(opt)} value={String(opt)}>{String(opt)}</option>)}
              </select>
            </div>
          );
        }

        // 处理布尔类型的属性
        if (valueType === 'boolean') {
          return (
            <div key={propKey} className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{propKey}</label>
              <button
                onClick={() => updateComponentProp(activeComponent.id, propKey, !propValue)}
                className={`w-9 h-5 rounded-full relative transition-colors ${propValue ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${propValue ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          );
        }

        // 处理数字类型的属性
        if (valueType === 'number') {
          return (
            <div key={propKey} className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize flex justify-between">
                {propKey}
                <span className="text-indigo-500 font-mono">{String(propValue)}</span>
              </label>
              <input
                type="range"
                min={schema?.min || 0}
                max={schema?.max || 100}
                value={propValue as number}
                onChange={(e) => updateComponentProp(activeComponent.id, propKey, parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          );
        }

        // 处理字符串类型的属性
        if (valueType === 'string') {
          const stringValue = propValue as string;
          return (
            <div key={propKey} className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{propKey}</label>
                {isString && (
                  <button
                    onClick={() => handleAIRewrite(activeComponent.id, propKey, propValue)}
                    disabled={isRewriting || !stringValue}
                    className="text-[10px] flex items-center gap-1 text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                  >
                    {isRewriting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    重写
                  </button>
                )}
              </div>
              {/* 根据字符串长度决定使用文本框还是输入框 */}
              {stringValue.length > 20 || propKey === 'description' ? (
                <textarea
                  value={stringValue}
                  onChange={(e) => updateComponentProp(activeComponent.id, propKey, e.target.value)}
                  disabled={isRewriting}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 min-h-[80px] resize-y disabled:opacity-50"
                />
              ) : (
                <input
                  type="text"
                  value={stringValue}
                  onChange={(e) => updateComponentProp(activeComponent.id, propKey, e.target.value)}
                  disabled={isRewriting}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              )}
            </div>
          );
        }

        // 处理其他类型的属性
        return (
          <div key={propKey} className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{propKey}</label>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{String(propValue)}</div>
          </div>
        );
      })}
    </div>
  );
};