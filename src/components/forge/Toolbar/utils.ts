// components/Toolbar/utils.ts
import { ComponentItem } from '@/types';
import { generateId } from '@/lib/utils';
import { COMPONENT_REGISTRY } from '@/config/components';

/**
 * 将导入的未知格式 JSON 数据归一化为标准的 ComponentItem 数组
 */
export const normalizeImportedItems = (rawItems: unknown): ComponentItem[] => {
  if (!Array.isArray(rawItems)) return [];

  const mapped = rawItems
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.type === 'string' && !!COMPONENT_REGISTRY[item.type])
    .map((item) => {
      const type = item.type as string;
      // 提取 props，如果没有则使用默认 props
      const rawProps = typeof item.props === 'object' && item.props !== null 
        ? item.props as Record<string, unknown> 
        : structuredClone(COMPONENT_REGISTRY[type].defaultProps);
      
      const rawStyle = typeof item.style === 'object' && item.style !== null 
        ? item.style as ComponentItem['style'] 
        : undefined;

      return {
        id: typeof item.id === 'string' && item.id ? item.id : generateId(),
        type,
        parentId: typeof item.parentId === 'string' ? item.parentId : undefined,
        props: rawProps,
        style: rawStyle
      } as ComponentItem;
    });

  // 确保 parentId 指向的父级真实存在
  const ids = new Set(mapped.map((item) => item.id));
  return mapped.map((item) => ({
    ...item,
    parentId: item.parentId && ids.has(item.parentId) ? item.parentId : undefined
  }));
};