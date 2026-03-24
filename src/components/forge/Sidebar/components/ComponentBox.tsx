/**
 * 组件箱组件
 * 用于展示和管理可用组件，支持搜索和拖拽功能
 */
import React, { useMemo, useState } from 'react';
import { Box } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';

/**
 * 组件分组配置
 * 将组件按功能分类展示
 */
const COMPONENT_GROUPS: Record<string, string[]> = {
  '基础输入': ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Switch'],
  '数据展示': ['Card', 'Badge', 'Avatar', 'Tabs', 'Table', 'Separator'],
  '交互结构': ['Dialog', 'DropdownMenu'],
  '反馈状态': ['Alert', 'Progress', 'Skeleton']
};

/**
 * 组件箱组件
 * 提供组件的搜索、分类展示和拖拽功能
 */
export const ComponentBox: React.FC = () => {
  const [search, setSearch] = useState('');
  // 标准化搜索关键词
  const normalizedSearch = search.trim().toLowerCase();

  // 根据搜索词过滤组件分组
  const filteredGroups = useMemo(() => {
    return Object.entries(COMPONENT_GROUPS)
      .map(([category, types]) => {
        // 过滤匹配的组件类型
        const matched = types.filter(type => 
          type.toLowerCase().includes(normalizedSearch) ||
          COMPONENT_REGISTRY[type]?.name.toLowerCase().includes(normalizedSearch)
        );
        return [category, matched] as const;
      })
      .filter(([, types]) => types.length > 0); // 只保留有匹配项的分组
  }, [normalizedSearch]);

  return (
    <section>
      {/* 组件箱标题 */}
      <div className="flex items-center gap-2 mb-3 text-orange-500 dark:text-orange-400">
        <Box size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          组件箱 ({Object.keys(COMPONENT_REGISTRY).length} COMPONENTS)
        </span>
      </div>
      {/* 搜索输入框 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索组件名称..."
        className="w-full mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900"
      />
      {/* 组件分组列表 */}
      <div className="space-y-4">
        {filteredGroups.map(([category, types]) => (
          <div key={category}>
            {/* 分组标题 */}
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-2">— {category}</div>
            {/* 组件列表 */}
            <div className="space-y-2">
              {types.map(type => {
                const config = COMPONENT_REGISTRY[type];
                return (
                  // 单个组件项
                  <div
                    key={type}
                    draggable // 支持拖拽
                    // 设置拖拽数据
                    onDragStart={(e) => {
                      e.dataTransfer.setData('forge-type', type);
                      e.dataTransfer.setData('text/plain', `forge-type:${type}`);
                    }}
                    // 点击添加组件
                    onClick={() => useForgeStore.getState().addComponent(type)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-grab hover:border-orange-500 group transition-all"
                  >
                    {/* 组件图标 */}
                    <div className="text-slate-400 group-hover:text-orange-500">{config.icon}</div>
                    {/* 组件名称 */}
                    <span className="text-xs font-medium text-slate-700 group-hover:text-orange-600">{config.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};