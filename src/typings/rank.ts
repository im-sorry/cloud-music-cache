export interface RankItem {
  duration?: number;
  score?: number;
  ts: number;
}

export type RankBasis = keyof RankItem;
