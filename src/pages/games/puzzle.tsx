import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Select } from 'antd';
import {
  UpSquareOutlined,
  LeftSquareOutlined,
  DownSquareOutlined,
  RightSquareOutlined,
} from '@ant-design/icons';
import RankComponent from './components/rank';
import electron from '../../electron';
import Rank from '../../utils/rank';
import { getSecondTs } from '../../utils/time';

import './puzzle.less';

enum KeyboardDirection {
  top = 'ArrowUp',
  bottom = 'ArrowDown',
  left = 'ArrowLeft',
  right = 'ArrowRight',
  none = '',
}

const name = 'digital-puzzle';
const { Option } = Select;
const GameWidth = 300;
const gridNumber = [3, 4, 5];
const DirectionsKeysSet = new Set(Object.values(KeyboardDirection));
// 打乱数字矩阵
const randomSort = (matrix: number[][], width: number) => {
  const produceDirection = (): KeyboardDirection => {
    return [
      KeyboardDirection.bottom,
      KeyboardDirection.left,
      KeyboardDirection.right,
      KeyboardDirection.top,
    ][Math.floor(Math.random() * 4)];
  };
  const steps = 100;
  let x = width - 1;
  let y = width - 1;
  for (let i = 0; i < steps; ) {
    switch (produceDirection()) {
      case KeyboardDirection.bottom:
        if (x === 0) continue;
        matrix[x][y] = matrix[x - 1][y];
        matrix[x - 1][y] = 0;
        x -= 1;
        break;
      case KeyboardDirection.top:
        if (x === width - 1) continue;
        matrix[x][y] = matrix[x + 1][y];
        matrix[x + 1][y] = 0;
        x += 1;
        break;
      case KeyboardDirection.left:
        if (y === width - 1) continue;
        matrix[x][y] = matrix[x][y + 1];
        matrix[x][y + 1] = 0;
        y += 1;
        break;
      case KeyboardDirection.right:
        if (y === 0) continue;
        matrix[x][y] = matrix[x][y - 1];
        matrix[x][y - 1] = 0;
        y -= 1;
        break;
      default:
        break;
    }
    i++;
  }
  return matrix;
};
// 检查是否完成拼图
const checkSuccess = (matrix: number[][], width: number) => {
  let idx = 1;
  let errorCount = 0;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < width; j++) {
      if (i === width - 1 && j === width - 1) continue;
      errorCount += Math.abs(matrix[i][j] - idx++);
    }
  }
  return !Boolean(errorCount);
};

export default function Puzzle() {
  const [isStarted, setIsStarted] = useState(false);
  const [width, setWidth] = useState(3);
  const [matrix, setMatrix] = useState<number[][]>([[]]);
  const [clickedDirectoin, setClickedDirection] = useState<KeyboardDirection>(
    KeyboardDirection.none
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [duration, setDuration] = useState(0);
  const [updateRank, setUpdateRank] = useState(false);
  const timeCounter = useRef(0);

  const anchor = useRef({ x: 0, y: 0 });

  const handleDirectionKeyClick = useCallback(
    (direction: KeyboardDirection) => {
      if (!isStarted || isSuccess) return;
      const { x, y } = anchor.current;
      switch (direction) {
        case KeyboardDirection.bottom:
          if (x === 0) return;
          matrix[x][y] = matrix[x - 1][y];
          matrix[x - 1][y] = 0;
          anchor.current.x = x - 1;
          setMatrix(matrix);
          break;

        case KeyboardDirection.top:
          if (x === width - 1) return;
          matrix[x][y] = matrix[x + 1][y];
          matrix[x + 1][y] = 0;
          anchor.current.x = x + 1;
          setMatrix(matrix);
          break;

        case KeyboardDirection.right:
          if (y === 0) return;
          matrix[x][y] = matrix[x][y - 1];
          matrix[x][y - 1] = 0;
          anchor.current.y = y - 1;
          setMatrix(matrix);
          break;

        case KeyboardDirection.left:
          if (y === width - 1) return;
          matrix[x][y] = matrix[x][y + 1];
          matrix[x][y + 1] = 0;
          anchor.current.y = y + 1;
          setMatrix(matrix);
          break;
        default:
          break;
      }
      if (checkSuccess(matrix, width)) {
        const now = getSecondTs();
        const duration = now - timeCounter.current;
        Rank.addRank(
          {
            duration,
            ts: now,
          },
          'duration',
          name
        );
        setUpdateRank(!updateRank);
        setDuration(duration);
        setIsSuccess(true);
      }
    },
    [isStarted, matrix, width, isSuccess, updateRank]
  );

  const handleStart = () => {
    let idx = 0;
    const nums = Array(width * width)
      .fill(0)
      .map((_, idx) => idx + 1);
    // 不能用随机排序，因为有可能还原不回来。只能模拟操作手动打乱排序
    nums.pop();
    nums.push(0);

    const matrix = Array(width)
      .fill(0)
      .map(() =>
        Array(width)
          .fill(0)
          .map(() => nums[idx++])
      );

    setMatrix(randomSort(matrix, width));
    setIsSuccess(false);
    timeCounter.current = getSecondTs();
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < width; j++) {
        if (matrix[i][j] === 0) {
          anchor.current.x = i;
          anchor.current.y = j;
          return;
        }
      }
    }
  };

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      const key = e.key as KeyboardDirection;
      if (!key || !DirectionsKeysSet.has(key)) return;
      setClickedDirection(key);
    };
    const keyUp = (e: KeyboardEvent) => {
      const key = e.key as KeyboardDirection;
      if (!key || !DirectionsKeysSet.has(key)) return;
      handleDirectionKeyClick(key);
      setClickedDirection(KeyboardDirection.none);
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [handleDirectionKeyClick]);
  useEffect(() => {
    electron.ipcRenderer.send('window:resize', 1000, 750);
    return () => {
      electron.ipcRenderer.send('window:recovery');
    };
  }, []);
  const renderMatrix = useMemo(() => {
    const itemWidth = (GameWidth - 2) / width;
    const style = { width: itemWidth, height: itemWidth };

    if (!matrix[0].length) {
      return Array(width * width)
        .fill(0)
        .map((_, idx) => (
          <div className="puzzle-item" style={style} key={idx}></div>
        ));
    }
    return matrix.reduce((prev, cur, idx1) => {
      prev.push(
        ...cur.map((num, idx2) => (
          <div className="puzzle-item" style={style} key={`${idx1}-${idx2}`}>
            {num ? (
              <div className="puzzle-circle flex-center" style={style}>
                {num}
              </div>
            ) : null}
          </div>
        ))
      );
      return prev;
    }, [] as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(matrix), width, matrix]);

  const computeDirectionKeyClassName = (
    direction: KeyboardDirection
  ): string => {
    let classList = ['direction-key'];
    if (direction === clickedDirectoin) classList.push('clicked');
    return classList.join(' ');
  };

  const directionKeyClickFactory = (direction: KeyboardDirection) => {
    return {
      onMouseUp: () => {
        setClickedDirection(KeyboardDirection.none);
        handleDirectionKeyClick(direction);
      },
      onMouseDown: () => {
        setClickedDirection(direction);
      },
    };
  };

  return (
    <div className="puzzle">
      <RankComponent className="rank" gameName={name} update={updateRank} />
      <div className="tool-bar">
        <Select
          style={{ width: 100, marginRight: 5 }}
          defaultValue={3}
          onChange={(val) => {
            setWidth(val);
            setMatrix([[]]);
            setIsStarted(false);
            setIsSuccess(false);
          }}
        >
          {gridNumber.map((num) => (
            <Option value={num} key={num}>
              {num} x {num}
            </Option>
          ))}
        </Select>
        <Button
          onClick={() => {
            setIsStarted(!isStarted || true);
            handleStart();
          }}
        >
          {isStarted ? '重新开始' : '开始'}
        </Button>
      </div>
      <div
        className="puzzle-wrapper"
        style={{ width: GameWidth, height: GameWidth }}
      >
        {isSuccess && (
          <div className="success flex-center">完成({duration}秒)</div>
        )}
        {renderMatrix}
      </div>
      <div className="keyboard-flash" style={{ width: GameWidth }}>
        <div className="top">
          <UpSquareOutlined
            className={computeDirectionKeyClassName(KeyboardDirection.top)}
            {...directionKeyClickFactory(KeyboardDirection.top)}
          />
        </div>
        <div className="bottom">
          <LeftSquareOutlined
            {...directionKeyClickFactory(KeyboardDirection.left)}
            className={computeDirectionKeyClassName(KeyboardDirection.left)}
          />
          <DownSquareOutlined
            {...directionKeyClickFactory(KeyboardDirection.bottom)}
            className={computeDirectionKeyClassName(KeyboardDirection.bottom)}
          />
          <RightSquareOutlined
            {...directionKeyClickFactory(KeyboardDirection.right)}
            className={computeDirectionKeyClassName(KeyboardDirection.right)}
          />
        </div>
      </div>
    </div>
  );
}
