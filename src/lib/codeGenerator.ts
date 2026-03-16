import { ComponentItem, Theme } from '@/types';
import { COMPONENT_REGISTRY } from '@/config/components';

type StyleMode = 'inline' | 'external' | 'tailwind';

/**
 * Helper: build inline style string from item.style
 */
function buildStyleString(style?: ComponentItem['style']): string {
  if (!style) return '{}';
  const parts: string[] = [];
  if (style.backgroundColor) parts.push(`backgroundColor: '${style.backgroundColor}'`);
  if (style.color) parts.push(`color: '${style.color}'`);
  if (style.borderColor) parts.push(`borderColor: '${style.borderColor}'`);
  if (style.borderRadius !== undefined) parts.push(`borderRadius: '${style.borderRadius}px'`);
  if (style.borderWidth !== undefined) parts.push(`borderWidth: '${style.borderWidth}px'`);
  if (style.padding !== undefined) parts.push(`padding: '${style.padding}px'`);
  if (style.fontSize !== undefined) parts.push(`fontSize: '${style.fontSize}px'`);
  if (style.width !== undefined) parts.push(`width: ${style.width === 'full' ? "'100%'" : (style.width === 'auto' ? 'undefined' : `'${style.width}'`)}`);
  if (style.height !== undefined) parts.push(`height: ${style.height === 'full' ? "'100%'" : (style.height === 'auto' ? 'undefined' : `'${style.height}'`)}`);

  const filtered = parts.filter(p => !p.includes('undefined'));
  if (filtered.length === 0) return '{}';
  return `{ ${filtered.join(', ')} }`;
}

/**
 * Generate external CSS file content for items
 */
export function generateExternalCSS(items: ComponentItem[]): string {
  const lines: string[] = [];
  items.forEach(item => {
    const s = item.style || {};
    const selector = `.cf-item-${item.id}`;
    const props: string[] = [];
    if (s.backgroundColor) props.push(`  background-color: ${s.backgroundColor};`);
    if (s.color) props.push(`  color: ${s.color};`);
    if (s.borderColor) props.push(`  border-color: ${s.borderColor};`);
    if (s.borderRadius !== undefined) props.push(`  border-radius: ${s.borderRadius}px;`);
    if (s.borderWidth !== undefined) props.push(`  border-width: ${s.borderWidth}px;`);
    if (s.padding !== undefined) props.push(`  padding: ${s.padding}px;`);
    if (s.fontSize !== undefined) props.push(`  font-size: ${s.fontSize}px;`);
    if (s.width !== undefined) {
      if (s.width === 'full') props.push(`  width: 100%;`);
      else if (s.width !== 'auto') props.push(`  width: ${s.width};`);
    }
    if (s.height !== undefined) {
      if (s.height === 'full') props.push(`  height: 100%;`);
      else if (s.height !== 'auto') props.push(`  height: ${s.height};`);
    }
    if (s.direction) {
      props.push(`  display: flex;`);
      props.push(`  flex-direction: ${s.direction};`);
    }
    if (props.length > 0) {
      lines.push(`${selector} {`);
      lines.push(...props);
      lines.push('}');
    }
  });
  return lines.join('\n');
}

// 新增：将样式映射为 Tailwind 类（尽量使用任意值语法以保留精确样式）
function mapStyleToTailwind(style?: ComponentItem['style']): string {
  if (!style) return '';
  const classes: string[] = [];
  if (style.backgroundColor) {
    classes.push(`bg-[${style.backgroundColor}]`);
  }
  if (style.color) {
    classes.push(`text-[${style.color}]`);
  }
  if (style.borderColor) {
    classes.push(`border-[${style.borderColor}]`);
  }
  if (style.borderWidth !== undefined) {
    classes.push(`border-[${style.borderWidth}px]`);
  }
  if (style.borderRadius !== undefined) {
    classes.push(`rounded-[${style.borderRadius}px]`);
  }
  if (style.padding !== undefined) {
    classes.push(`p-[${style.padding}px]`);
  }
  if (style.fontSize !== undefined) {
    classes.push(`text-[${style.fontSize}px]`);
  }
  if (style.width !== undefined) {
    if (style.width === 'full') classes.push('w-full');
    else if (style.width !== 'auto') classes.push(`w-[${style.width}]`);
  }
  if (style.height !== undefined) {
    if (style.height === 'full') classes.push('h-full');
    else if (style.height !== 'auto') classes.push(`h-[${style.height}]`);
  }
  if (style.direction) {
    classes.push('flex');
    classes.push(style.direction === 'row' ? 'flex-row' : 'flex-col');
  }
  return classes.filter(Boolean).join(' ');
}

// 新增：为 JSX 元素构建 className 属性
function buildClassAttrJSX(item: ComponentItem, baseClass: string | undefined, styleMode: StyleMode): string {
  if (styleMode === 'inline') return baseClass ? ` className="${baseClass}"` : '';
  if (styleMode === 'external') {
    const combined = [baseClass, `cf-item-${item.id}`].filter(Boolean).join(' ');
    return combined ? ` className="${combined}"` : '';
  }
  const tail = mapStyleToTailwind(item.style);
  const combined = [baseClass, tail].filter(Boolean).join(' ');
  return combined ? ` className="${combined}"` : '';
}

// 新增：为 HTML 元素构建 class 属性
function buildClassAttrHTML(item: ComponentItem, baseClass: string | undefined, styleMode: StyleMode): string {
  if (styleMode === 'inline') return baseClass ? ` class="${baseClass}"` : '';
  if (styleMode === 'external') {
    const combined = [baseClass, `cf-item-${item.id}`].filter(Boolean).join(' ');
    return combined ? ` class="${combined}"` : '';
  }
  const tail = mapStyleToTailwind(item.style);
  const combined = [baseClass, tail].filter(Boolean).join(' ');
  return combined ? ` class="${combined}"` : '';
}

/**
 * 生成单个组件的 JSX
 */
function generateComponentJSX(item: ComponentItem, indent: number = 0, theme?: Theme, styleMode: StyleMode = 'inline'): string {
  const spaces = ' '.repeat(indent);
  const config = COMPONENT_REGISTRY[item.type];
  if (!config) return '';

  const styleStr = buildStyleString(item.style);
  const props = item.props || {};

  switch (item.type) {
    case 'Button': {
      const children = props.children || 'Button';
      const variant = props.variant ? `variant="${props.variant}"` : '';
      const size = props.size ? `size="${props.size}"` : '';
      const classAttr = buildClassAttrJSX(item, undefined, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<Button ${variant} ${size}${classAttr}${styleAttr}>
${spaces}  ${children}
${spaces}</Button>`;
    }

    case 'Card': {
      const classAttr = buildClassAttrJSX(item, undefined, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<Card${classAttr}${styleAttr}>
${spaces}  <CardHeader>
${spaces}    <CardTitle>${props.title || 'Card Title'}</CardTitle>
${props.description ? `${spaces}    <CardDescription>${props.description}</CardDescription>\n` : ''}${spaces}  </CardHeader>
${props.content ? `${spaces}  <CardContent>${props.content}</CardContent>\n` : ''}${props.footerPrimary || props.footerSecondary ? `${spaces}  <CardFooter className="justify-end gap-2">\n${props.footerSecondary ? `${spaces}    <Button variant="outline" size="sm">${props.footerSecondary}</Button>\n` : ''}${props.footerPrimary ? `${spaces}    <Button size="sm">${props.footerPrimary}</Button>\n` : ''}${spaces}  </CardFooter>\n` : ''}${spaces}</Card>`;
    }

    case 'Input': {
      const classAttr = buildClassAttrJSX(item, undefined, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<Input type="${props.type || 'text'}" placeholder="${props.placeholder || ''}"${classAttr}${styleAttr} />`;
    }

    case 'Textarea': {
      const classAttr = buildClassAttrJSX(item, undefined, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<Textarea rows={${props.rows ?? 3}} placeholder="${props.placeholder || ''}"${classAttr}${styleAttr} />`;
    }

    case 'Avatar': {
      const fallback = props.fallback || 'A';
      const src = props.src ? `<AvatarImage src="${props.src}" alt="${fallback}" />` : '';
      const classAttr = buildClassAttrJSX(item, undefined, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<Avatar${classAttr}${styleAttr}>
${src ? `${spaces}  ${src}\n` : ''}${spaces}  <AvatarFallback>${fallback}</AvatarFallback>
${spaces}</Avatar>`;
    }

    case 'Badge': {
      const classAttr = buildClassAttrJSX(item, undefined, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<Badge ${props.variant ? `variant="${props.variant}"` : ''}${classAttr}${styleAttr}>${props.text || 'Badge'}</Badge>`;
    }

    case 'Alert': {
      const classAttr = buildClassAttrJSX(item, undefined, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<Alert${classAttr}${styleAttr} variant="${props.variant || 'default'}">
${spaces}  <AlertTitle>${props.title || 'Alert'}</AlertTitle>
${spaces}  <AlertDescription>${props.description || ''}</AlertDescription>
${spaces}</Alert>`;
    }

    case 'Progress': {
      const value = props.value ?? 50;
      const inlineFill = styleMode === 'inline' && item.style?.backgroundColor ? `, backgroundColor: '${item.style.backgroundColor}'` : '';
      const outerClassAttr = buildClassAttrJSX(item, undefined, styleMode);
      return `${spaces}<div style={{ width: '100%' }}${outerClassAttr}>
${spaces}  <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '${theme?.muted}' }}>
${spaces}    <div className="h-full transition-all" style={{ width: \`\${${value}}%\`${inlineFill} }} />
${spaces}  </div>
${spaces}</div>`;
    }

    case 'Switch': {
      const base = 'flex items-center gap-2';
      const classAttr = buildClassAttrJSX(item, base, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<label${classAttr}${styleAttr}>
${spaces}  <Switch checked={${props.checked ? 'true' : 'false'}} />
${spaces}  <span>${props.label || 'Switch'}</span>
${spaces}</label>`;
    }

    case 'Checkbox': {
      const base = 'flex items-center gap-2';
      const classAttr = buildClassAttrJSX(item, base, styleMode);
      const styleAttr = styleMode === 'inline' && styleStr !== '{}' ? ` style=${styleStr}` : '';
      return `${spaces}<label${classAttr}${styleAttr}>
${spaces}  <Checkbox checked={${props.checked ? 'true' : 'false'}} />
${spaces}  <span>${props.label || 'Checkbox'}</span>
${spaces}</label>`;
    }

    case 'Separator':
      return props.orientation === 'vertical'
        ? `${spaces}<div style={{ width: '1px', height: '100%', backgroundColor: '${theme?.border}' }}${buildClassAttrJSX(item, undefined, styleMode)} />`
        : `${spaces}<hr style={{ borderColor: '${theme?.border}' }}${buildClassAttrJSX(item, undefined, styleMode)} />`;

    case 'Skeleton': {
      const lines = props.lines ?? 3;
      const base = 'space-y-3 animate-pulse';
      const classAttr = buildClassAttrJSX(item, base, styleMode);
      return `${spaces}<div${classAttr}>
${Array.from({ length: lines as number }).map(() => `${spaces}  <div className="h-4 bg-gray-200 rounded"></div>`).join('\n')}
${spaces}</div>`;
    }

    default:
      return `${spaces}/* ${item.type} not implemented for export */`;
  }
}

/**
 * 生成 React + TypeScript 代码
 */
export function generateReactCode(items: ComponentItem[], theme: Theme, styleMode: StyleMode = 'inline'): string {
  if (items.length === 0) {
    return `import React from 'react';

export default function EmptyComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">画布为空，请添加组件</p>
    </div>
  );
}`;
  }

  const imports = new Set<string>();
  items.forEach(item => imports.add(item.type));

  const importMap: Record<string, string> = {
    Card: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';`,
    Avatar: `import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';`,
    Alert: `import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';`
  };

  const importStatements = Array.from(imports)
    .map((comp) => importMap[comp] || `import { ${comp} } from '@/components/ui/${comp.toLowerCase()}';`)
    .join('\n');

  const styleImport = styleMode === 'external' ? "import './styles.css';\n" : '';
  const componentJSX = items.map(item => generateComponentJSX(item, 4, theme, styleMode)).join('\n');

  return `import React from 'react';
${styleImport}${importStatements}

export default function GeneratedComponent() {
  return (
    <div className="p-8 space-y-4" style={{ backgroundColor: '${theme.background}', color: '${theme.foreground}' }}>
${componentJSX}
    </div>
  );
}`;
}

/**
 * 生成 React (JavaScript) 代码
 */
export function generateReactJSCode(items: ComponentItem[], theme: Theme, styleMode: StyleMode = 'inline'): string {
  return generateReactCode(items, theme, styleMode);
}

/**
 * 生成 HTML + Tailwind CSS 代码
 */
export function generateHTMLCode(items: ComponentItem[], theme: Theme, styleMode: StyleMode = 'inline'): string {
  if (items.length === 0) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shadcn Forge - Generated</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="background-color: ${theme.background}; color: ${theme.foreground};">
  <div class="flex items-center justify-center min-h-screen">
    <p class="text-gray-500">画布为空，请添加组件</p>
  </div>
</body>
</html>`;
  }

  const componentHTML = items.map(item => generateComponentHTML(item, 2, styleMode)).join('\n');
  const externalStyles = styleMode === 'external' ? `<style>
${generateExternalCSS(items)}
</style>` : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shadcn Forge - Generated</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --primary: ${theme.primary};
      --background: ${theme.background};
      --foreground: ${theme.foreground};
      --muted: ${theme.muted};
      --border: ${theme.border};
      --radius: ${theme.radius};
    }
  </style>
${externalStyles}
</head>
<body style="background-color: ${theme.background}; color: ${theme.foreground};">
  <div class="p-8 space-y-4">
${componentHTML}
  </div>
</body>
</html>`;
}

function generateComponentHTML(item: ComponentItem, indent: number = 0, styleMode: StyleMode = 'inline'): string {
  const spaces = ' '.repeat(indent);
  const props = item.props || {};

  switch (item.type) {
    case 'Button': {
      const base = 'px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition-colors';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<button${cls}>
${spaces}  ${props.children || 'Button'}
${spaces}</button>`;
    }

    case 'Card': {
      const base = 'border rounded-lg p-6 bg-white shadow-sm';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<div${cls}>
${spaces}  <h3 class="text-lg font-bold mb-2">${props.title || 'Card Title'}</h3>
${spaces}  <p class="text-gray-600">${props.description || 'Card description'}</p>
${spaces}</div>`;
    }

    case 'Input': {
      const base = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<input${cls}
${spaces}  type="${props.type || 'text'}"
${spaces}  placeholder="${props.placeholder || 'Enter text...'}"
${spaces}/>`;
    }

    case 'Textarea': {
      const base = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<textarea${cls}
${spaces}  placeholder="${props.placeholder || 'Enter text...'}"
${spaces}  rows="${props.rows || 3}"
${spaces}></textarea>`;
    }

    case 'Avatar': {
      const base = 'w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<div${cls}>
${spaces}  <span class="text-sm font-medium">${props.fallback || 'A'}</span>
${spaces}</div>`;
    }

    case 'Badge': {
      const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<span${cls}>
${spaces}  ${props.text || 'Badge'}
${spaces}</span>`;
    }

    case 'Alert': {
      const base = 'border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<div${cls}>
${spaces}  <h4 class="font-bold text-indigo-800">${props.title || 'Alert'}</h4>
${spaces}  <p class="text-indigo-700 text-sm mt-1">${props.description || 'Alert description'}</p>
${spaces}</div>`;
    }

    case 'Progress': {
      const base = 'w-full bg-gray-200 rounded-full h-2';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<div${cls}>
${spaces}  <div class="bg-indigo-500 h-2 rounded-full" style="width: ${props.value || 50}%"></div>
${spaces}</div>`;
    }

    case 'Switch': {
      const base = 'flex items-center gap-2 cursor-pointer';
      const cls = buildClassAttrHTML(item, base, styleMode);
      const checked = props.checked ? 'checked' : '';
      return `${spaces}<label${cls}>
${spaces}  <div class="relative inline-block w-10 h-6 bg-gray-300 rounded-full transition-colors">
${spaces}    <input type="checkbox" class="sr-only" ${checked} />
${spaces}    <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
${spaces}  </div>
${spaces}  <span class="text-sm">${props.label || 'Switch'}</span>
${spaces}</label>`;
    }

    case 'Checkbox': {
      const base = 'flex items-center gap-2 cursor-pointer';
      const cls = buildClassAttrHTML(item, base, styleMode);
      const checked = props.checked ? 'checked' : '';
      return `${spaces}<label${cls}>
${spaces}  <input type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" ${checked} />
${spaces}  <span class="text-sm">${props.label || 'Checkbox'}</span>
${spaces}</label>`;
    }

    case 'Separator':
      return props.orientation === 'vertical'
        ? `${spaces}<div class="w-px h-full bg-gray-300"></div>`
        : `${spaces}<hr class="border-gray-300" />`;

    case 'Skeleton': {
      const base = 'space-y-3 animate-pulse';
      const cls = buildClassAttrHTML(item, base, styleMode);
      return `${spaces}<div${cls}>
${spaces}  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
${spaces}  <div class="h-4 bg-gray-200 rounded"></div>
${spaces}  <div class="h-4 bg-gray-200 rounded w-5/6"></div>
${spaces}</div>`;
    }

    default:
      return `${spaces}<!-- ${item.type} component -->`;
  }
}

/**
 * 生成 Vue 3 单文件组件
 */
export function generateVueCode(items: ComponentItem[], theme: Theme, styleMode: StyleMode = 'inline'): string {
  const html = generateHTMLCode(items, theme, styleMode);
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const css = styleMode === 'external' ? generateExternalCSS(items) : '';

  return `<template>
  <div class="p-8 space-y-4" style="background-color: ${theme.background}; color: ${theme.foreground};">
${body.trim()}
  </div>
</template>

<script setup>
// Vue 3 SFC generated by Shadcn-Forge
</script>

<style scoped>
${css}
</style>`;
}

/**
 * 生成完整的可运行项目结构
 */
export function generateProjectStructure(items: ComponentItem[], theme: Theme, styleMode: StyleMode = 'inline'): Record<string, string> {
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: 'shadcn-forge-export',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        '@radix-ui/react-avatar': '^1.0.4',
        '@radix-ui/react-progress': '^1.0.3',
        '@radix-ui/react-switch': '^1.0.3',
        '@radix-ui/react-checkbox': '^1.0.4',
        '@radix-ui/react-separator': '^1.0.3',
        'lucide-react': '^0.294.0',
        'class-variance-authority': '^0.7.0',
        clsx: '^2.0.0',
        'tailwind-merge': '^2.0.0'
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@vitejs/plugin-react': '^4.2.0',
        autoprefixer: '^10.4.16',
        postcss: '^8.4.32',
        tailwindcss: '^3.3.6',
        typescript: '^5.3.0',
        vite: '^5.0.0'
      }
    }, null, 2),

    'src/App.tsx': generateReactCode(items, theme, styleMode),

    'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

    'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${theme.primary};
  --background: ${theme.background};
  --foreground: ${theme.foreground};
  --muted: ${theme.muted};
  --border: ${theme.border};
  --radius: ${theme.radius};
}`,

    'index.html': generateHTMLCode(items, theme, styleMode),

    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}`,

    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    }, null, 2)
  };

  if (styleMode === 'external') {
    files['src/styles.css'] = generateExternalCSS(items);
  }

  return files;
}

export function generateComponentJSXSnippet(item: ComponentItem, theme: Theme, styleMode: StyleMode = 'inline'): string {
  return generateComponentJSX(item, 0, theme, styleMode).trim();
}