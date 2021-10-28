// @ts-nocheck
import React, { useMemo, useState } from 'react';
import './App.less';
import { Menu, Form, Input, Button } from 'antd';
import { DownloadOutlined, LoginOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

interface MyWindow extends Window {
  electron: any;
}
const _ = window as unknown as MyWindow;

const { Item } = Form;

function App() {
  const [selectedKey, setKey] = useState('cache');
  const content = useMemo(() => {
    if (selectedKey === 'cache') {
      const localvals = _.electron.getLocalVals();
      const { src_dir, target_dir, minute } = localvals;
      const onSrcDirChange = (e) => {
        const files = document.getElementById('src-dir').files;
        console.log(files);
      }
      const onTargetDirChange = () => {
        console.log(arguments, 'target')
      }
      return (
        <div className="cache">
          <Form>
            <Item label="读取路径">
              <Input value={src_dir} />
              <Button
                onClick={() => {
                  console.log(_.electron.ipcRenderer.sendSync('read-src-dir', src_dir), 'srcdir')
                  // 一般情况下不用校验dir，因为是用户选出来的
                }}
              >更改路径</Button>
            </Item>
            <Item label="存储路径">
              <Input value={src_dir} />
              <Button
                onClick={() => {
                  console.log(_.electron.ipcRenderer.sendSync('read-target-dir', src_dir), 'targetdir')
                  // 一般情况下不用校验dir，因为是用户选出来的
                }}
              >更改路径</Button>
            </Item>
          </Form>
        </div>
      );
    } else if (selectedKey === 'login') {
      return (
        <div className="login">login</div>
      );
    }
  }, [selectedKey]);
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
