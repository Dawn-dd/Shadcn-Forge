import React, { useState, useMemo } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { generateReactCode, generateReactJSCode, generateHTMLCode, generateVueCode, generateProjectStructure } from '@/lib/codeGenerator';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const CodeExporter: React.FC = () => {
  const { canvasItems, theme } = useForgeStore();
  // 框架与语言选择
  const [framework, setFramework] = useState<'react' | 'vue' | 'html'>('react');
  const [language, setLanguage] = useState<'ts' | 'js'>('ts');
  const [copied, setCopied] = useState(false);
  const [styleMode, setStyleMode] = useState<'inline' | 'external' | 'tailwind'>('inline');
  const [downloadZip, setDownloadZip] = useState(false);

  // 生成代码
  const code = useMemo(() => {
    if (framework === 'react') {
      return language === 'ts' ? generateReactCode(canvasItems, theme, styleMode) : generateReactJSCode(canvasItems, theme, styleMode);
    }
    if (framework === 'vue') {
      return generateVueCode(canvasItems, theme, styleMode);
    }
    // html
    return generateHTMLCode(canvasItems, theme, styleMode);
  }, [/*codeType*/ framework, language, canvasItems, theme, styleMode]);

  // 高亮代码
  const highlightedCode = useMemo(() => {
    try {
      const lang = framework === 'react' ? (language === 'ts' ? 'tsx' : 'jsx') : (framework === 'html' ? 'html' : 'html');
      const prismLang = lang === 'tsx' ? Prism.languages.tsx : (lang === 'jsx' ? Prism.languages.jsx : Prism.languages.html);
      return Prism.highlight(code, prismLang, lang as any);
    } catch (error) {
      console.error('代码高亮失败:', error);
      return code;
    }
  }, [code, /*codeType*/ framework, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleDownload = () => {
    try {
      if (downloadZip) {
        // generate project structure
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

  return (
    <div className="w-full max-w-5xl bg-white dark:bg-[#0d0d0d] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">框架</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value as any)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-sm"
            >
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="html">HTML + Tailwind</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">语言</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-sm"
              disabled={framework !== 'react'}
            >
              <option value="ts">TypeScript (TSX)</option>
              <option value="js">JavaScript (JSX)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">样式导出</label>
            <select
              value={styleMode}
              onChange={(e) => setStyleMode(e.target.value as any)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-sm"
            >
              <option value="inline">Inline (内联)</option>
              <option value="external">External CSS</option>
              <option value="tailwind">Tailwind-mapped</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="text-xs text-slate-500 block mr-2">ZIP</label>
            <input type="checkbox" checked={downloadZip} onChange={(e) => setDownloadZip(e.target.checked)} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? '已复制' : '复制代码'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-all shadow-sm"
          >
            <Download size={14} />
            下载文件
          </button>
        </div>
      </div>

      {/* 代码显示区域 */}
      <div className="overflow-auto max-h-[600px] custom-scrollbar">
        <pre className="p-6 text-xs leading-relaxed">
          <code
            className={`language-${framework === 'react' ? (language === 'ts' ? 'tsx' : 'jsx') : 'html'}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};