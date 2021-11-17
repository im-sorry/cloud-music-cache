// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import './App.less';
import {
  Menu,
  Form,
  Input,
  Button,
  Select,
  message,
  Checkbox,
  Tooltip,
} from 'antd';
import {
  DownloadOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';

interface MyWindow extends Window {
  electron: any;
}
const _ = window as unknown as MyWindow;

const { Item } = Form;
const { Option } = Select;
const minutes = [2, 5, 10, 30];

function App() {
  const [selectedKey, setKey] = useState('cache');
  const [src_dir, setSrcDir] = useState('');
  const [target_dir, setTargetDir] = useState('');
  const [minute, setMinute] = useState(5);
  const [isStart, setIsStart] = useState(false);
  const [MUSIC_U, setMUSIC_U] = useState('');
  const [userId, setUserId] = useState(0);
  const [diff, setDiff] = useState(false); // 是否要把歌区分到喜欢和不喜欢，如果不区分，默认放到不喜欢目录里
  const [shouldGetUserInfo, setShould] = useState(false);

  useEffect(() => {
    const localvals = _.electron.getLocalVals();
    const { src_dir, target_dir, minute, diff, MUSIC_U, userId } = localvals;
    setSrcDir(src_dir);
    setTargetDir(target_dir);
    setMinute(minute);
    setDiff(diff);
    setMUSIC_U(MUSIC_U);
    setUserId(userId);
    if (diff && (!MUSIC_U || !userId)) {
      setShould(true);
    }
  }, []);
  const content = useMemo(() => {
    if (selectedKey === 'cache') {
      return (
        <div className="cache">
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 20 }}>
            <Item
              label={
                <span>
                  读取路径
                  <Tooltip
                    title={
                      <div>
                        这个地址是存储网易云播放过的音乐缓存地址，一般不需改变。
                        <br />
                        如何检查这个地址是否有用？
                        <br />
                        进入到这个目录[{src_dir}]
                        <br />
                        查看这个目录里是否有以.uc或.uc!结尾的文件。
                        <br />
                        如果存在，说明这个地址是正确的。
                        <br />
                        如果不存在，说明网易云可能更改了缓存音乐存放地址，请自行找寻新地址，或者联系开发者。
                      </div>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
            >
              <div className="table-content">
                <Input value={src_dir} />
                <Button
                  disabled={isStart}
                  onClick={() => {
                    const [srcdir] = _.electron.ipcRenderer.sendSync(
                      'read-src-dir',
                      src_dir
                    );
                    if (srcdir) {
                      if (srcdir !== src_dir) {
                        _.electron.setLocalVals({ src_dir: srcdir });
                        setSrcDir(srcdir);
                      }
                      message.success('更新成功');
                    }
                    // 一般情况下不用校验dir，因为是用户选出来的
                  }}
                >
                  更改路径
                </Button>
              </div>
            </Item>
            <Item label="存储路径">
              <div className="table-content">
                <Input value={target_dir} />
                <Button
                  disabled={isStart}
                  onClick={() => {
                    const [tardir] = _.electron.ipcRenderer.sendSync(
                      'read-target-dir',
                      target_dir
                    );
                    if (tardir) {
                      if (target_dir !== tardir) {
                        _.electron.setLocalVals({ target_dir: tardir });
                        setTargetDir(tardir);
                      }
                      message.success('更新成功');
                    }
                    // 一般情况下不用校验dir，因为是用户选出来的
                  }}
                >
                  更改路径
                </Button>
              </div>
            </Item>
            <Item label="更新间隔">
              <Select
                value={minute}
                onChange={(minute: number) => {
                  setMinute(minute);
                  _.electron.setLocalVals({ minute });
                }}
                disabled={isStart}
              >
                {minutes.map((m) => (
                  <Option key={m} value={m}>
                    每{m}分钟更新一次
                  </Option>
                ))}
              </Select>
            </Item>
            <Item
              label={
                <span>
                  喜爱歌曲单独存储
                  <Tooltip title="是否将我喜欢的歌曲和普通歌曲存储到不同文件夹(需要获取网易云登录信息)？默认会将所有歌曲存到不喜欢的文件夹中">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
            >
              <Checkbox
                disabled={isStart}
                checked={diff}
                onChange={() => {
                  setDiff(!diff);
                  _.electron.setLocalVals({ diff: !diff });
                  if (!diff && (!MUSIC_U || !userId)) setShould(true);
                }}
              />
            </Item>
          </Form>
          <Button
            onClick={() => {
              if (shouldGetUserInfo) {
                const { type, msg, MUSIC_U, userId } =
                  _.electron.ipcRenderer.sendSync('get_user');
                if (typeof message[type] === 'function') {
                  message[type](msg);
                }
                if (type === 'success') {
                  setMUSIC_U(MUSIC_U);
                  setUserId(userId);
                  setShould(false);
                }
                return;
              }
              if (!target_dir) {
                message.warn('请选择存储路径');
                return;
              }
              setIsStart(!isStart);
              _.electron.ipcRenderer.send('start', {
                src_dir,
                target_dir,
                minute,
                isStart: !isStart,
                MUSIC_U,
                userId,
              });
            }}
          >
            {shouldGetUserInfo
              ? '登录网易云获取用户信息'
              : isStart
              ? '暂停'
              : '开始'}
          </Button>
        </div>
      );
    } else if (selectedKey === 'donation') {
      return <span>跪求个两三块钱公交钱^_^</span>;
    }
  }, [
    selectedKey,
    src_dir,
    target_dir,
    minute,
    isStart,
    MUSIC_U,
    userId,
    diff,
    shouldGetUserInfo,
  ]);
  return (
    <div className="App">
      <div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={[selectedKey]}
          className="menu"
          onClick={({ key }) => {
            setKey(key);
          }}
        >
          <Menu.Item key="cache" icon={<DownloadOutlined />}>
            缓存
          </Menu.Item>
          <Menu.Item key="donation" icon={<HeartOutlined />}>
            支持作者
          </Menu.Item>
        </Menu>
      </div>
      <div className="content flex-center">{content}</div>
    </div>
  );
}

export default App;
