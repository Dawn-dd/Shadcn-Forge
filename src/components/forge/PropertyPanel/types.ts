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