import electron from '../electron';
import { RankBasis, RankItem } from '../typings/rank';
import { LocalVals } from '../typings/stotage';

export default class Rank {
  static gameName = '';

  static clearRank(gameName = '') {
    gameName = gameName || Rank.gameName;
    if (!gameName) return;
    const localVals = electron.getLocalVals() as LocalVals;
    const { gameRankData = {} } = localVals;
    gameRankData[gameName] = [];
    electron.setLocalVals({ gameRankData });
  }

  static getRankList(gameName = ''): RankItem[] {
    gameName = gameName || Rank.gameName;
    if (!gameName) return [];
    const localVals = electron.getLocalVals() as LocalVals;
    const { gameRankData = {} } = localVals;
    return gameRankData[gameName] || [];
  }

  static addRank(
    { score = 0, duration = 0, ts }: RankItem,
    rankBasisPriority: RankBasis = 'duration',
    gameName = ''
  ) {
    gameName = gameName || Rank.gameName;
    let coefficient = 1;

    if (!ts) return;
    if (!gameName) return;
    if (!score && !duration) return;
    if (!duration && score) {
      rankBasisPriority = 'score';
      coefficient = -1;
    }

    const localVals = electron.getLocalVals() as LocalVals;
    const { gameRankData = { [gameName]: [] } } = localVals;

    if (gameRankData[gameName]) {
      gameRankData[gameName].push({
        score,
        duration,
        ts,
      });
    } else {
      gameRankData[gameName] = [
        {
          score,
          duration,
          ts,
        },
      ];
    }
    gameRankData[gameName] = gameRankData[gameName].sort(
      (a: any, b: any) =>
        (a[rankBasisPriority] - b[rankBasisPriority]) * coefficient
    );
    electron.setLocalVals({
      gameRankData,
    });
  }
}
