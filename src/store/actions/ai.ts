import { StateCreator } from 'zustand';
import { ForgeStore, AISessionEntry } from '@/types';

export interface AIActions { // 定义 AIActions 接口，包含 AI 相关的状态操作方法
  appendAISessionEntry: (entry: Omit<AISessionEntry, 'timestamp'>) => void;
  clearAISessionLog: () => void;
}

export const createAIActions: StateCreator< /** * 创建 AI 状态切片的函数 * @param set Zustand 的 set 函数，用于更新状态 * @returns 包含 AI 操作方法的对象 */
  ForgeStore,
  [],
  [],
  AIActions
> = (set) => ({
  appendAISessionEntry: (entry) => //  添加 AI 会话条目，同时自动添加时间戳，并保留最新的 12 条记录
    set((state) => ({
      aiSessionLog: [...state.aiSessionLog, { ...entry, timestamp: Date.now() }].slice(-12)
    })),

  clearAISessionLog: () => set({ aiSessionLog: [] }) //  清空 AI 会话日志
});