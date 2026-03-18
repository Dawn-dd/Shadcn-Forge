import { Layout } from '@/types';

export interface ContextMenuState {
  x: number;
  y: number;
  itemId: string;
}

export type DropPosition = 'before' | 'after';

export const getAlignClass = (align: Layout['align']) => {
  switch (align) {
    case 'start': return 'items-start';
    case 'center': return 'items-center';
    case 'end': return 'items-end';
    default: return 'items-center';
  }
};

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