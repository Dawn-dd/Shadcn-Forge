import { ComponentItem } from '@/types';

/**
 * 克隆组件项，确保深拷贝 props 和 style
 */
export const cloneComponentItem = (item: ComponentItem): ComponentItem => ({
  ...item,
  props: structuredClone(item.props),
  style: item.style ? structuredClone(item.style) : undefined
});

/**
 * 收集嵌套组件的所有 ID
 */
export const collectNestedIds = (items: ComponentItem[], rootIds: string[]): Set<string> => {
  const ids = new Set(rootIds);
  const queue = [...rootIds];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    items.forEach((item) => {
      if (item.parentId === currentId && !ids.has(item.id)) {
        ids.add(item.id);
        queue.push(item.id);
      }
    });
  }

  return ids;
};

/**
 * 过滤顶层 ID（排除父组件也在选中列表中的子组件）
 */
export const filterTopLevelIds = (items: ComponentItem[], ids: string[]): string[] => {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const idSet = new Set(ids);

  return ids.filter((id) => {
    let parentId = itemMap.get(id)?.parentId;

    while (parentId) {
      if (idSet.has(parentId)) {
        return false;
      }
      parentId = itemMap.get(parentId)?.parentId;
    }

    return true;
  });
};

/**
 * 获取粘贴操作的插入索引
 */
export const getPasteInsertIndex = (items: ComponentItem[], anchorIds: string[]): number => {
  if (anchorIds.length === 0) {
    return items.length;
  }

  const anchorSet = collectNestedIds(items, anchorIds);
  let insertIndex = items.length;

  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (anchorSet.has(items[index].id)) {
      insertIndex = index + 1;
      break;
    }
  }

  return insertIndex;
};

/**
 * 收集组件及其所有后代的 ID
 */
export const collectDescendantIds = (items: ComponentItem[], rootId: string): Set<string> => {
  const descendantIds = new Set<string>();
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    descendantIds.add(currentId);

    items.forEach((item) => {
      if (item.parentId === currentId && !descendantIds.has(item.id)) {
        queue.push(item.id);
      }
    });
  }

  return descendantIds;
};