// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import puzzle from '../../img/puzzle.jpeg';
import './index.less';

const gameList = [
  {
    name: '数字拼图',
    path: 'puzzle',
    img: puzzle,
  },
];

export default function GameHall() {
  const navigate = useNavigate();

  return (
    <div className="game-hall">
      {gameList.map(({ name, path, img }) => (
        <div
          className="game-card"
          onClick={() => {
            navigate(`/${path}`);
          }}
          key={name}
        >
          <div className="img-wrapper">
            <img src={img} alt="" />
          </div>
          <div className="game-name">{name}</div>
        </div>
      ))}
    </div>
  );
}
