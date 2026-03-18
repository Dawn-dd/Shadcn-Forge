import { useState, useMemo } from 'react';
import { useForgeStore } from '@/store/forgeStore';
import { 
  generateReactCode, 
  generateReactJSCode, 
  generateHTMLCode, 
  generateVueCode, 
  generateProjectStructure 
} from '@/lib/codeGenerator';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Framework, Language, StyleMode } from './types';

export const useCodeExport = () => {
  const { canvasItems, theme } = useForgeStore();
  
  // 配置状态
  const [framework, setFramework] = useState<Framework>('react');
  const [language, setLanguage] = useState<Language>('ts');
  const [styleMode, setStyleMode] = useState<StyleMode>('inline');
  const [downloadZip, setDownloadZip] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. 动态生成代码
  const code = useMemo(() => {
    if (framework === 'react') {
      return language === 'ts' 
        ? generateReactCode(canvasItems, theme, styleMode) 
        : generateReactJSCode(canvasItems, theme, styleMode);
    }
    if (framework === 'vue') {
      return generateVueCode(canvasItems, theme, styleMode);
    }
    return generateHTMLCode(canvasItems, theme, styleMode);
  }, [framework, language, canvasItems, theme, styleMode]);

  // 2. Prism 语法高亮
  const highlightedCode = useMemo(() => {
    try {
      const lang = framework === 'react' ? (language === 'ts' ? 'tsx' : 'jsx') : 'html';
      const prismLang = lang === 'tsx' ? Prism.languages.tsx : (lang === 'jsx' ? Prism.languages.jsx : Prism.languages.html);
      return Prism.highlight(code, prismLang, lang);
    } catch (error) {
      console.error('代码高亮失败:', error);
      return code; // 降级返回纯文本
    }
  }, [code, framework, language]);

  // 3. 剪贴板操作
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 4. 下载逻辑 (单文件或 ZIP 项目)
  const handleDownload = () => {
    try {
      if (downloadZip) {
        // 生成 ZIP 包
        const files = generateProjectStructure(canvasItems, theme, styleMode);
        const zip = new JSZip();
        Object.keys(files).forEach(path => {
          zip.file(path, files[path]);
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
          saveAs(content, 'shadcn-forge-export.zip');
        });
        return;
      }

      // 生成单文件下载
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      let filename = 'component.txt';
      if (framework === 'react') filename = language === 'ts' ? 'Component.tsx' : 'Component.jsx';
      else if (framework === 'html') filename = 'index.html';
      else if (framework === 'vue') filename = 'Component.vue';
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  return {
    framework, setFramework,
    language, setLanguage,
    styleMode, setStyleMode,
    downloadZip, setDownloadZip,
    copied, code, highlightedCode,
    handleCopy, handleDownload
  };
};