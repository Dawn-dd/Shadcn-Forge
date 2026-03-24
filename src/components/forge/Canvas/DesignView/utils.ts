import { Layout } from '@/types';

/**
 * 右键菜单状态接口
 * 定义右键菜单的位置和目标项ID
 */
export interface ContextMenuState {
  x: number;
  y: number;
  itemId: string;
}

/**
 * 拖放位置类型
 * 定义元素可以放置的位置：在目标项之前或之后
 */
export type DropPosition = 'before' | 'after';

/**
 * 根据对齐方式获取对应的CSS类名
 * @param align - 布局对齐方式
 * @returns 返回对应的Tailwind CSS类名
 */
export const getAlignClass = (align: Layout['align']) => {
  switch (align) {
    case 'start': return 'items-start';
    case 'center': return 'items-center';
    case 'end': return 'items-end';
    default: return 'items-center';
  }
};

// 函数，主要用于生成 CSS 样式对象，以控制布局中子元素的对齐方式。
export const getItemAlignmentStyle = (
  alignSelf: Layout['align'] | 'stretch' | undefined,
  direction: Layout['direction']
) => {
  if (direction === 'row') {
    switch (alignSelf) {
      case 'center': return { marginLeft: 'auto', marginRight: 'auto' };
      case 'end': return { marginLeft: 'auto' };
      case 'stretch': return { flex: '1 1 0%' };
      default: return {};
    }
  }

  switch (alignSelf) {
    case 'start': return { alignSelf: 'flex-start' as const };
    case 'center': return { alignSelf: 'center' as const };
    case 'end': return { alignSelf: 'flex-end' as const };
    case 'stretch': return { alignSelf: 'stretch' as const };
    default: return {};
  }
};

// 该函数用于根据项目的样式和布局方向计算并返回项目的框架样式。它处理项目的宽度、高度、对齐方式和水平偏移，并根据布局方向（行或列）返回相应的样式对象。
export const getItemFrameStyle = (item: { style?: { width?: string; height?: string; alignSelf?: Layout['align'] | 'stretch'; horizontalOffset?: number } }, itemLayout: Layout) => {
  const width = item.style?.width;
  const height = item.style?.height;
  const alignStyle = getItemAlignmentStyle(item.style?.alignSelf, itemLayout.direction);
  const horizontalOffset = item.style?.horizontalOffset ?? 0;

  if (itemLayout.direction === 'row') {
    return {
      ...alignStyle,
      width: width && width !== 'auto' && width !== 'full' ? width : undefined,
      height: height && height !== 'auto' && height !== 'full' ? height : undefined,
      flex: width === 'full' ? '1 1 0%' : (alignStyle as { flex?: string }).flex,
      marginLeft:
        horizontalOffset > 0 && width !== 'full'
          ? `clamp(0px, ${horizontalOffset}%, 320px)`
          : (alignStyle as { marginLeft?: string }).marginLeft,
      marginRight: (alignStyle as { marginRight?: string }).marginRight
    };
  }

  return {
    ...alignStyle,
    width: width === 'full' ? '100%' : width && width !== 'auto' ? width : undefined,
    height: height === 'full' ? '100%' : height && height !== 'auto' ? height : undefined
  };
};