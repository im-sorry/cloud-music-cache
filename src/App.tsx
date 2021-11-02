// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import './App.less';
import { Menu, Form, Input, Button, Select, message } from 'antd';
import { DownloadOutlined, LoginOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    const localvals = _.electron.getLocalVals();
    const { src_dir, target_dir, minute } = localvals;
    setSrcDir(src_dir);
    setTargetDir(target_dir);
    setMinute(minute);
  }, []);
  const content = useMemo(() => {
    if (selectedKey === 'cache') {
      return (
        <div className="cache">
          <Form>
            <Item label="读取路径">
              <div className="table-content">
                <Input value={src_dir} />
                <Button
                  disabled={isStart}
                  onClick={() => {
                    const [srcdir] = _.electron.ipcRenderer.sendSync('read-src-dir', src_dir);
                    if (srcdir) {
                      if (srcdir !== src_dir) {
                        _.electron.setLocalVals({ src_dir: srcdir });
                        setSrcDir(srcdir);
                      }
                      message.success('更新成功');
                    }
                    // 一般情况下不用校验dir，因为是用户选出来的
                  }}
                >更改路径</Button>
              </div>
            </Item>
            <Item label="存储路径">
              <div className="table-content">
              <Input value={target_dir} />
                <Button
                  disabled={isStart}
                  onClick={() => {
                    const [tardir] = _.electron.ipcRenderer.sendSync('read-target-dir', target_dir);
                    if (tardir) {
                      if (target_dir !== tardir) {
                        _.electron.setLocalVals({ target_dir: tardir });
                        setTargetDir(tardir);
                      }
                      message.success('更新成功');
                    }
                    // 一般情况下不用校验dir，因为是用户选出来的
                  }}
                >更改路径</Button>
              </div>
            </Item>
            <Item label="更新间隔">
              <Select
                defaultValue={minute}
                onChange={(val: number) => {
                  setMinute(val);
                  _.electron.setLocalVals({ minute });
                }}
                disabled={isStart}
              >
                {minutes.map(m => (
                  <Option key={m} value={m}>每{m}分钟更新一次</Option>
                ))}
              </Select>
            </Item>
          </Form>
          <Button
            onClick={() => {
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
              });
            }}
          >
            {isStart ? '暂停' : '开始'}
          </Button>
        </div>
      );
    } else if (selectedKey === 'login') {
      return (
        <div className="login">login</div>
      );
    }
  }, [selectedKey, src_dir, target_dir, minute, isStart]);
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
          <Menu.Item key="login" icon={<LoginOutlined />}>
            登录
          </Menu.Item>
        </Menu>
      </div>
      <div className="content flex-center">
        {content}
      </div>
    </div>
  );
}

export default App;
