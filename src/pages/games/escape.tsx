// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'antd';
import RankComponent from './components/rank';
import { resizeWindow } from './utils';
import Rank from '../../utils/rank';
import { getSecondTs } from '../../utils/time';
import gw_circle2 from '../../img/gw_circle2.jpeg';
import gw_circle3 from '../../img/gw_circle3.jpeg';
import gw_circle4 from '../../img/gw_circle4.png';
import gw_circle5 from '../../img/gw_circle5.png';
import gw_circle6 from '../../img/gw_circle6.png';
import gw_rect3 from '../../img/gw_rect3.jpeg';
import gw_rect4 from '../../img/gw_rect4.jpeg';
import gw_rect6 from '../../img/gw_rect6.jpeg';
import gw_rect7 from '../../img/gw_rect7.jpeg';
import gw_rect8 from '../../img/gw_rect8.jpeg';
import gw_rect9 from '../../img/gw_rect9.jpeg';
import bg1 from '../../img/bg1.jpeg';
import bg2 from '../../img/bg2.jpeg';
import bg3 from '../../img/bg3.jpeg';
import bg4 from '../../img/bg4.jpeg';

import './escape.less';
const NAME = 'escape-ball';

let index = 0;
const FRAME_WIDTH = 900;
const FRAME_HEIGHT = 600;
const USER_BALL_SIZE = 50;
const SHAPGE_TYPES = ['rect', 'circle'];
const CIRCLE_GWS = [gw_circle2, gw_circle3, gw_circle4, gw_circle5, gw_circle6];
const BGS = [bg1, bg2, bg3, bg4];
const RECT_GWS = [
  {
    img: gw_rect3,
    width: 58,
    height: 133,
  },
  {
    img: gw_rect4,
    width: 62,
    height: 46,
  },
  {
    img: gw_rect6,
    width: 300,
    height: 271,
  },
  {
    img: gw_rect7,
    width: 196,
    height: 255,
  },
  {
    img: gw_rect8,
    width: 253,
    height: 256,
  },
  {
    img: gw_rect9,
    width: 166,
    height: 340,
  },
];
const DIFFCULT = {
  1: {
    name: '简单',
    speeds: [-2, -1, 1, 2], // 怪物速度
    max_size: 130, // 怪物最大体型
    min_size: 20, // 怪物最小体型
    obstacle_num: 15, // 怪物数量
  },
  2: {
    name: '中等',
    speeds: [-3, -2, 2, 3],
    max_size: 170,
    min_size: 30,
    obstacle_num: 15,
  },
  3: {
    name: '困难',
    speeds: [-3.5, -3, -2, 2, 3, 3.5],
    max_size: 200,
    min_size: 50,
    obstacle_num: 18,
  },
};

function random(arr: number[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber(start, end) {
  return start + Math.random() * end;
}
function randomSize(mode) {
  return (
    DIFFCULT[mode].min_size +
    Math.floor(Math.random() * DIFFCULT[mode].max_size)
  );
}
function conflictCircle(x1, y1, r1, x2, y2, r2) {
  if (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) <= Math.pow(r1 + r2, 2))
    return true;
  return false;
}
function conflictRect(x1, y1, r1, x2, y2, width, height) {
  if (x1 >= x2 && x1 <= x2 + width) return true;
  if (y1 >= y2 && y1 <= y2 + height) return true;
  if (x1 < x2 && y1 < y2) return conflictCircle(x1, y1, r1, x2, y2, 0);
  if (x1 > x2 && y1 < y2) return conflictCircle(x1, y1, r1, x2 + width, y2, 0);
  if (x1 < x2 && y1 > y2) return conflictCircle(x1, y1, r1, x2, y2 + height, 0);
  return conflictCircle(x1, y1, r1, x2 + width, y2 + height, 0);
}
function getRectShape(basicSize: number) {
  let { width, height, img } = random(RECT_GWS);
  if (width > height) {
    height = (height / width) * basicSize;
    width = basicSize;
  } else {
    width = (width / height) * basicSize;
    height = basicSize;
  }
  return {
    width,
    height,
    img,
  };
}

function produceShape(mode) {
  const type = random(SHAPGE_TYPES);
  const id = `${type}${index++}`;
  const width = randomSize(mode);
  const height = type === 'rect' ? randomSize(mode) : width;
  const x = randomNumber(0, FRAME_WIDTH - width);
  const y = randomNumber(0, FRAME_HEIGHT - height);
  return {
    width,
    height,
    type,
    speedx: random(DIFFCULT[mode]['speeds']),
    speedy: random(DIFFCULT[mode]['speeds']),
    x,
    y,
    id,
    img: type === 'circle' ? random(CIRCLE_GWS) : '',
    ...(type === 'rect' ? getRectShape(width) : {}),
  };
}
function boundary(max, value) {
  if (value <= 0) return 0;
  if (value >= max) return max;
  return value;
}
function transform(el: HTMLElement, x: number, y: number) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}
function produceShapeList(mode) {
  let shapeNum = DIFFCULT[mode]['obstacle_num'];
  const shapeList = [
    {
      x: 0,
      y: 0,
      width: USER_BALL_SIZE,
      height: USER_BALL_SIZE,
    },
  ];
  for (let i = 0; i < shapeNum; ) {
    const shapeItem = produceShape(mode);
    if (
      // 新生产的怪物不与已经生成的怪物位置冲突
      shapeList.every(({ x, y, width, height }) => {
        if (x + width <= shapeItem.x || x >= shapeItem.x + shapeItem.width)
          return true;
        if (y + height <= shapeItem.y || y >= shapeItem.height + shapeItem.y)
          return true;
        return false;
      })
    ) {
      shapeList.push(shapeItem);
      i++;
    }
  }
  shapeList.shift();
  return shapeList;
}

export default function Escape() {
  const user = useRef<HTMLElement>();
  const [showMask, setMask] = useState(true);
  const [mode, setMode] = useState('1');
  const [buttonText, setButtonText] = useState('开始');
  const [updateRank, setUpdateRank] = useState(false);
  const [maskMsg, setMaskMsg] = useState('');
  const [bgImg, setBgImg] = useState(BGS[0]);
  const userPosition = useRef({
    x: 0,
    y: 0,
  });
  const timer = useRef(0);
  const timeCounter = useRef(0);

  const shapeList = useMemo(() => {
    const list = produceShapeList(mode);
    return list;
  }, [mode]);

  useEffect(() => {
    return resizeWindow(1200, 750);
  }, []);

  useEffect(() => {
    const userDom = user.current;
    if (!userDom) return;
    const initMousePos = {
      x: 0,
      y: 0,
    };
    const userPos = {
      x: 0,
      y: 0,
    };

    const onMouseMove = (e: MouseEvent) => {
      const w = e.clientX - initMousePos.x;
      const h = e.clientY - 50 - initMousePos.y;
      const x = boundary(FRAME_WIDTH - USER_BALL_SIZE, userPos.x + w);
      const y = boundary(FRAME_HEIGHT - USER_BALL_SIZE, userPos.y + h);
      userPosition.current.x = x;
      userPosition.current.y = y;
      userDom.style.transform = `translate(${x}px, ${y}px)`;
      if (
        x + USER_BALL_SIZE === FRAME_WIDTH &&
        y + USER_BALL_SIZE === FRAME_HEIGHT
      ) {
        const now = getSecondTs();
        const duration = now - timeCounter.current;
        Rank.addRank(
          {
            ts: now,
            duration,
          },
          'duration',
          NAME
        );

        setUpdateRank(!updateRank);
        setMask(true);
        setMaskMsg(`你成功达到安全区。耗时${duration}秒`);
        clearTimeout(timer.current);
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      initMousePos.x = e.clientX;
      initMousePos.y = e.clientY - 50;
      document.addEventListener('mousemove', onMouseMove);
    };
    const onMouseUp = (e: MouseEvent) => {
      userPos.x = boundary(
        FRAME_WIDTH - USER_BALL_SIZE,
        userPos.x + e.clientX - initMousePos.x
      );
      userPos.y = boundary(
        FRAME_HEIGHT - USER_BALL_SIZE,
        userPos.y + e.clientY - initMousePos.y - 50
      );
      document.removeEventListener('mousemove', onMouseMove);
    };
    userDom.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      userDom.removeEventListener('mousedown', onMouseDown);
    };
  }, [showMask, updateRank]);

  const onStart = () => {
    timeCounter.current = getSecondTs();
    // 初始化小球位置
    user.current.style.transform = `translate(0px, 0px)`;
    userPosition.current.x = 0;
    userPosition.current.y = 0;
    const shapeMove = () => {
      const shapes = shapeList.map((shape) => ({
        ...shape,
        el: document.getElementById(shape.id),
      }));
      function run() {
        for (let shape of shapes) {
          let { el, x, y, speedx, speedy, width, height, type } = shape;
          const next = () => {
            if (x <= 0 || x + width >= FRAME_WIDTH) {
              shape.speedx = -speedx;
            }
            if (y <= 0 || y + height >= FRAME_HEIGHT) {
              shape.speedy = -speedy;
            }
            x += shape.speedx;
            y += shape.speedy;
            shape.x = x;
            shape.y = y;
            transform(el, shape.x, shape.y);
          };
          const end = () => {
            clearTimeout(timer.current);
            setMaskMsg('你被怪物抓到了😭😭😭');
            setMask(true);
          };
          // 未来可以做怪物之间碰撞检测

          // 看是否和玩家相撞
          const { x: _x, y: _y } = userPosition.current;
          if (x + width < _x) {
            next();
            continue;
          }
          if (_x + USER_BALL_SIZE < x) {
            next();
            continue;
          }
          if (y + height < _y) {
            next();
            continue;
          }
          if (_y + USER_BALL_SIZE < y) {
            next();
            continue;
          }
          if (type === 'circle') {
            if (
              conflictCircle(
                _x + USER_BALL_SIZE / 2,
                _y + USER_BALL_SIZE / 2,
                USER_BALL_SIZE / 2,
                x + width / 2,
                y + height / 2,
                width / 2
              )
            ) {
              return end();
            }
          } else if (type === 'rect') {
            if (
              conflictRect(
                _x + USER_BALL_SIZE / 2,
                _y + USER_BALL_SIZE / 2,
                USER_BALL_SIZE / 2,
                x,
                y,
                width,
                height
              )
            ) {
              return end();
            }
          }
          next();
        }
        timer.current = setTimeout(run, 1000 / 60);
      }
      run();
    };
    shapeMove();
    setMask(false);
    setButtonText('重新开始');
    setBgImg(random(BGS));
  };

  return (
    <div className="escape">
      <div
        className="ball-frame"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          background: `url(${bgImg}) 100% / cover no-repeat`,
        }}
      >
        {showMask && (
          <div className="mask">
            {maskMsg && <div className="msg">{maskMsg}</div>}
            <Button className="start-button" ghost onClick={onStart}>
              {buttonText}
            </Button>
          </div>
        )}
        <div className="user" ref={user}></div>
        {shapeList.map(({ type, id, width, height, x, y, img }) => (
          <div
            key={id}
            className={`gw ${type}`}
            id={id}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width,
              height,
              borderRadius: type === 'circle' ? '50%' : '0',
              transformOrigin: '0',
              transform: `translate(${x}px, ${y}px)`,
              zIndex: 1,
              background: `url(${img}) 100% / cover no-repeat`,
            }}
          ></div>
        ))}
        <div className="black-hole">安全区</div>
      </div>
      <div className="difficulty">
        {Object.entries(DIFFCULT).map(([_mode, { name }]) => (
          <div
            className={`mode ${_mode === mode ? 'selected' : ''}`}
            onClick={() => {
              setMode(_mode);
              setMask(true);
              setMaskMsg('');
              clearTimeout(timer.current);
            }}
          >
            {name}
          </div>
        ))}
      </div>
      <RankComponent
        gameName={NAME}
        update={updateRank}
        className="escape-rank-component"
      ></RankComponent>
      <div className="game-msg">
        玩法：操控左上角的小人头像，顺利到达右下角的安全区即可胜利。过程中不可被怪物撞到。
        <br />
        提示：来回切换游戏难度可以随机改变怪物出现位置
      </div>
    </div>
  );
}
