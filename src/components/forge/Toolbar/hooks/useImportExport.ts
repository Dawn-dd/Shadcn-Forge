// components/Toolbar/useImportExport.ts
import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useForgeStore } from '@/store/forgeStore';
import { generateProjectStructure } from '@/lib/codeGenerator';
import { ComponentItem } from '@/types';
import { normalizeImportedItems } from '../utils';

export interface ImportPreviewPayload {
  fileName: string;
  canvasItems: ComponentItem[];
  theme?: Record<string, unknown>;
  layout?: Record<string, unknown>;
}

export const useImportExport = (setActiveTab: (tab: 'design' | 'inspect' | 'export') => void) => {
  const { theme, layout, canvasItems, loadFromSnapshot } = useForgeStore();
  
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingImport, setPendingImport] = useState<ImportPreviewPayload | null>(null);

  // 导出 ZIP
  const handleExportZip = async () => {
    try {
      const files = generateProjectStructure(canvasItems, theme, 'inline');
      const snapshot = {
        version: 1,
        exportedAt: new Date().toISOString(),
        theme,
        layout,
        canvasItems
      };

      const zip = new JSZip();
      Object.entries(files).forEach(([path, content]) => zip.file(path, content));
      zip.file('snapshot.json', JSON.stringify(snapshot, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'shadcn-forge-export.zip');
    } catch (error) {
      console.error('Export zip failed', error);
      window.alert('导出 ZIP 失败，请重试。');
    }
  };

  // 处理 JSON 文件选择与解析
  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;

      const canvasData = Array.isArray(payload)
        ? payload
        : (typeof payload === 'object' && payload !== null && Array.isArray((payload as { canvasItems?: unknown[] }).canvasItems)
            ? (payload as { canvasItems: unknown[] }).canvasItems
            : []);

      const normalizedItems = normalizeImportedItems(canvasData);

      if (normalizedItems.length === 0) {
        window.alert('JSON 中未找到可导入的组件数据。');
        return;
      }

      const themePatch = typeof payload === 'object' && payload !== null
        ? (payload as { theme?: Record<string, unknown> }).theme
        : undefined;
      const layoutPatch = typeof payload === 'object' && payload !== null
        ? (payload as { layout?: Record<string, unknown> }).layout
        : undefined;

      // 唤起确认弹窗
      setPendingImport({
        fileName: file.name,
        canvasItems: normalizedItems,
        theme: themePatch,
        layout: layoutPatch
      });
    } catch (error) {
      console.error('Import json failed', error);
      window.alert('导入失败：请确认 JSON 格式正确。');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  // 确认执行导入并覆盖当前画布
  const handleConfirmImport = () => {
    if (!pendingImport) return;
    loadFromSnapshot({
      canvasItems: pendingImport.canvasItems,
      theme: pendingImport.theme,
      layout: pendingImport.layout
    });
    setPendingImport(null);
    setActiveTab('design');
    window.alert(`导入成功：${pendingImport.canvasItems.length} 个组件`);
  };

  return {
    importInputRef,
    pendingImport,
    setPendingImport,
    handleExportZip,
    handleImportJSON,
    handleConfirmImport
  };
};