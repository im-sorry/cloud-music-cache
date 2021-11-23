import React, { useEffect, useState } from 'react';
import './rank.less';
import { RankItem } from '../../../typings/rank';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import URank from '../../../utils/rank';

import './rank.less';

const DateFormat = 'YYYY/MM/DD';
const rankNumColor = {
  0: 'red',
  1: '#a9870c',
  2: '#0c8ca9',
} as { [key: number]: string };

export default function Rank(
  props: React.PropsWithChildren<{
    className?: string;
    gameName: string;
    showClearRankButton?: boolean;
    update?: boolean;
  }>
) {
  const {
    className = '',
    showClearRankButton = true,
    gameName,
    update,
  } = props;
  const [rankList, setRankList] = useState<RankItem[]>([]);

  useEffect(() => {
    setRankList(URank.getRankList(gameName));
  }, [gameName, update]);

  return (
    <div className={['rank-wrapper', className].join(' ')}>
      <div className="title">战绩榜</div>
      <div className="rank-list">
        {rankList.length ? (
          rankList.map(({ duration, score, ts }, idx) => (
            <div className="rank-item" key={idx}>
              <div
                className="rank-num"
                style={{ color: rankNumColor[idx] || '#000' }}
              >
                {idx + 1}
              </div>
              {duration ? (
                <div className="duration column">
                  <span className="label">耗时</span>
                  <span>{duration}秒</span>
                </div>
              ) : null}
              {score ? (
                <div className="score column">
                  <span className="label">得分</span>
                  <span>{score}分</span>
                </div>
              ) : null}
              <div className="column">
                <span className="label">时间</span>
                <span>{dayjs.unix(ts).format(DateFormat)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="none">暂无数据</div>
        )}
        {showClearRankButton && (
          <div
            className="clear"
            onClick={() => {
              Modal.confirm({
                title: '确定清除战绩吗？',
                onOk: () => {
                  setRankList([]);
                  URank.clearRank(gameName);
                },
                okText: '确定',
                cancelText: '取消',
              });
            }}
          >
            清除战绩
          </div>
        )}
      </div>
    </div>
  );
}
