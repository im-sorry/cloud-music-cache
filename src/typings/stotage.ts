import { RankItem } from './rank';

export interface LocalVals {
  gameRankData: {
    [key: string]: RankItem[];
  };
}
