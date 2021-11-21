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
    console.log(localVals, 'localvals');
    const { gameRankData = {} } = localVals;
    return gameRankData[gameName] || [];
  }

  static addRank(
    { score = 0, duration = 0 }: RankItem,
    rankBasisPriority: RankBasis = 'duration',
    gameName = ''
  ) {
    gameName = gameName || Rank.gameName;
    if (!gameName) return;
    if (!score && !duration) return;
    if (!duration && score) rankBasisPriority = 'score';

    const localVals = electron.getLocalVals() as LocalVals;
    const { gameRankData = { [gameName]: [] } } = localVals;

    if (gameRankData[gameName]) {
      gameRankData[gameName].push({
        score,
        duration,
      });
    } else {
      gameRankData[gameName] = [
        {
          score,
          duration,
        },
      ];
    }
    gameRankData[gameName].sort(
      (a: any, b: any) => b[rankBasisPriority] - a[rankBasisPriority]
    );
    console.log(gameRankData, 'gameRankData');
    electron.setLocalVals({
      gameRankData,
    });
  }
}
