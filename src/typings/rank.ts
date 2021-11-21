export interface RankItem {
  duration?: number;
  score?: number;
}

export type RankBasis = keyof RankItem;
