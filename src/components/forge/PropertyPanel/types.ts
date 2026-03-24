/**
 * 本文件定义了本地重写功能相关的类型接口
 * 包括重写模式、候选对象、载荷以及属性差异等类型
 */
import { AIGeneratedComponent } from '@/types';

export type LocalRewriteMode = 'copy' | 'structure' | 'both';

export interface LocalRewriteCandidate {
  summary?: string;
  targetProps?: Record<string, unknown>;
  children?: AIGeneratedComponent[];
}

export interface LocalRewritePayload {
  summary?: string;
  targetProps?: Record<string, unknown>;
  children?: AIGeneratedComponent[];
  candidates?: LocalRewriteCandidate[];
}

export interface PropDiffEntry {
  key: string;
  before: unknown;
  after: unknown;
  changed: boolean;
}