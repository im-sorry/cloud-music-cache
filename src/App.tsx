import React, { useEffect } from 'react';
import './App.less';
import { Menu } from 'antd';
import {
  DownloadOutlined,
  HeartOutlined,
  RedditOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';

import 'antd/dist/antd.css';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/cache');
  }, []);

  return (
    <div className="App">
      <div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['cache']}
          className="menu"
          onClick={({ key }) => {
            navigate(`/${key}`);
          }}
        >
          <Menu.Item key="cache" icon={<DownloadOutlined />}>
            缓存
          </Menu.Item>
          <Menu.Item key="donation" icon={<HeartOutlined />}>
            支持作者
          </Menu.Item>
          <Menu.Item key="gamehall" icon={<RedditOutlined />}>
            游戏厅
          </Menu.Item>
        </Menu>
      </div>
      <div className="content flex-center">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
