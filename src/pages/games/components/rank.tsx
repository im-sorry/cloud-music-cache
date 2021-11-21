import React from 'react';
import './rank.less';
import { RankItem } from '../../../typings/rank';
import './rank.less';

export default function Rank(
  props: React.PropsWithChildren<{
    list: RankItem[];
    className?: string;
    gameName: string;
  }>
) {
  const { list, className = '' } = props;
  const rankNumColor = {
    0: 'red',
    1: '#a9870c',
    2: '#0c8ca9',
  } as { [key: number]: string };
  return (
    <div className={['rank-wrapper', className].join(' ')}>
      <div className="title">战绩榜</div>
      <div className="rank-list">
        {list.length ? (
          list.map(({ duration, score }, idx) => (
            <div className="rank-item" key={idx}>
              <div
                className="rank-num"
                style={{ color: rankNumColor[idx] || '#000' }}
              >
                {idx + 1}
              </div>
              {duration ? (
                <div className="duration">
                  <span className="label">耗时</span>
                  <span>{duration}秒</span>
                </div>
              ) : null}
              {score ? (
                <div className="score">
                  <span className="label">得分</span>
                  <span>{score}分</span>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="none">暂无数据</div>
        )}
      </div>
    </div>
  );
}
