// src/hooks/useGlobalShortcuts.ts
import { useEffect } from 'react';
import { useForgeStore } from '@/store/forgeStore';

export const useGlobalShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果用户正在输入框/textarea 里，跳过
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

      const {
        activeComponentId,
        selectedComponentIds,
        removeComponent,
        removeSelectedComponents,
        copySelectedComponents,
        pasteClipboard,
        undo,
        redo,
        clearSelection
      } = useForgeStore.getState();

      // Delete / Backspace → 删除选中组件
      if ((e.key === 'Delete' || e.key === 'Backspace') && (activeComponentId || selectedComponentIds.length > 0)) {
        e.preventDefault();
        if (selectedComponentIds.length > 1) {
          removeSelectedComponents();
        } else if (activeComponentId) {
          removeComponent(activeComponentId);
        }
        return;
      }

      // Ctrl/Cmd + C → 复制
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && (activeComponentId || selectedComponentIds.length > 0)) {
        e.preventDefault();
        copySelectedComponents();
        return;
      }

      // Ctrl/Cmd + V → 粘贴
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteClipboard();
        return;
      }

      // Ctrl/Cmd + Z → 撤销
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y → 重做
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Escape → 取消选中
      if (e.key === 'Escape' && (activeComponentId || selectedComponentIds.length > 0)) {
        e.preventDefault();
        clearSelection();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};