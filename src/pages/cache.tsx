// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Select, message, Checkbox, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import './cache.less';
import electron from '../electron';

const { Item } = Form;
const { Option } = Select;
const minutes = [2, 5, 10, 30];

function Cache() {
  const [src_dir, setSrcDir] = useState('');
  const [target_dir, setTargetDir] = useState('');
  const [minute, setMinute] = useState(5);
  const [isStart, setIsStart] = useState(false);
  const [MUSIC_U, setMUSIC_U] = useState('');
  const [userId, setUserId] = useState(0);
  const [diff, setDiff] = useState(false); // 是否要把歌区分到喜欢和不喜欢，如果不区分，默认放到不喜欢目录里
  const [shouldGetUserInfo, setShould] = useState(false);

  useEffect(() => {
    const onMessage = (message) => {
      console.log(message, 'message');
    };
    window.onmessage = onMessage;
    return () => {};
  }, []);

  const onStart = () => {
    if (shouldGetUserInfo) {
      const { type, msg, MUSIC_U, userId } =
        electron.ipcRenderer.sendSync('get_user');
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
    electron.ipcRenderer.send('start', {
      src_dir,
      target_dir,
      minute,
      isStart: !isStart,
      MUSIC_U,
      userId,
    });
  };

  useEffect(() => {
    const localvals = electron.getLocalVals();
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
    return (
      <div className="cache flex-center">
        <div className="desc">
          本工具可以把网易云播放过的歌曲下载到指定目录，未播放过的歌曲不会同步。1.
          本工具需要联网，以查询歌曲信息 2.
          不论是否是网易云会员，只要歌曲能完整播放出来就能下载。3.需要先听歌，才能下载。建议听歌时把本工具打开，可以实时同步刚听过的歌曲。
        </div>
        <div className="wrapper">
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
                    const [srcdir] = electron.ipcRenderer.sendSync(
                      'read-src-dir',
                      src_dir
                    );
                    if (srcdir) {
                      if (srcdir !== src_dir) {
                        electron.setLocalVals({ src_dir: srcdir });
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
                    const [tardir] = electron.ipcRenderer.sendSync(
                      'read-target-dir',
                      target_dir
                    );
                    if (tardir) {
                      if (target_dir !== tardir) {
                        electron.setLocalVals({ target_dir: tardir });
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
                  electron.setLocalVals({ minute });
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
                  <Tooltip title="是否将我喜欢的歌曲和普通歌曲存储到不同文件夹？(需要获取网易云登录信息) 默认会将所有歌曲存到不喜欢的文件夹中">
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
                  electron.setLocalVals({ diff: !diff });
                  if (!diff && (!MUSIC_U || !userId)) setShould(true);
                }}
              />
            </Item>
          </Form>
          <Button onClick={onStart}>
            {shouldGetUserInfo
              ? '登录网易云获取用户信息'
              : isStart
              ? '暂停'
              : '开始'}
          </Button>
        </div>
      </div>
    );
  }, [
    src_dir,
    target_dir,
    minute,
    isStart,
    MUSIC_U,
    userId,
    diff,
    shouldGetUserInfo,
  ]);
  return content;
}

export default Cache;
