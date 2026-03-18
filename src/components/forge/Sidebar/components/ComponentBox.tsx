import React, { useMemo, useState } from 'react';
import { Box } from 'lucide-react';
import { useForgeStore } from '@/store/forgeStore';
import { COMPONENT_REGISTRY } from '@/config/components';

const COMPONENT_GROUPS: Record<string, string[]> = {
  '基础输入': ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Switch'],
  '数据展示': ['Card', 'Badge', 'Avatar', 'Tabs', 'Table', 'Separator'],
  '交互结构': ['Dialog', 'DropdownMenu'],
  '反馈状态': ['Alert', 'Progress', 'Skeleton']
};

export const ComponentBox: React.FC = () => {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return Object.entries(COMPONENT_GROUPS)
      .map(([category, types]) => {
        const matched = types.filter(type => 
          type.toLowerCase().includes(normalizedSearch) ||
          COMPONENT_REGISTRY[type]?.name.toLowerCase().includes(normalizedSearch)
        );
        return [category, matched] as const;
      })
      .filter(([, types]) => types.length > 0);
  }, [normalizedSearch]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 text-orange-500 dark:text-orange-400">
        <Box size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          组件箱 ({Object.keys(COMPONENT_REGISTRY).length} COMPONENTS)
        </span>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索组件名称..."
        className="w-full mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900"
      />
      <div className="space-y-4">
        {filteredGroups.map(([category, types]) => (
          <div key={category}>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-2">— {category}</div>
            <div className="space-y-2">
              {types.map(type => {
                const config = COMPONENT_REGISTRY[type];
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('forge-type', type);
                      e.dataTransfer.setData('text/plain', `forge-type:${type}`);
                    }}
                    onClick={() => useForgeStore.getState().addComponent(type)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-grab hover:border-orange-500 group transition-all"
                  >
                    <div className="text-slate-400 group-hover:text-orange-500">{config.icon}</div>
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