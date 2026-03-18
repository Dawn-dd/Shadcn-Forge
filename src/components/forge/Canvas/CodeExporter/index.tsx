import React from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { useCodeExport } from './useCodeExport';
import { Framework, Language, StyleMode } from './types';

// 仅在此处引入主题样式
import 'prismjs/themes/prism-tomorrow.css';

export const CodeExporter: React.FC = () => {
  const {
    framework, setFramework,
    language, setLanguage,
    styleMode, setStyleMode,
    downloadZip, setDownloadZip,
    copied, highlightedCode,
    handleCopy, handleDownload
  } = useCodeExport();

  return (
    <div className="w-full max-w-5xl bg-white dark:bg-[#0d0d0d] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">框架</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value as Framework)}
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
              onChange={(e) => setLanguage(e.target.value as Language)}
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
              onChange={(e) => setStyleMode(e.target.value as StyleMode)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-sm"
            >
              <option value="inline">Inline (内联)</option>
              <option value="external">External CSS</option>
              <option value="tailwind">Tailwind-mapped</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="text-xs text-slate-500 block mr-2">ZIP</label>
            <input 
              type="checkbox" 
              checked={downloadZip} 
              onChange={(e) => setDownloadZip(e.target.checked)} 
            />
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