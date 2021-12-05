const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  BrowserView,
} = require('electron');
const url = require('url');
const path = require('path');
const startCache = require('./lib');
const { setLocalVals } = require('./store');
const { getUserIdFromMUSIC_U } = require('./utils');

const env = ((process.argv[2] || '').match(/--env=([A-z]+)/) || ['prod'])[1];
const isDev = env === 'dev';
let removeJobs = null;

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 530,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (isDev) {
    win.loadURL('http://localhost:5000');
  } else
    win.loadURL(
      url.format({
        protocol: 'file:',
        slashes: true,
        pathname: path.join(__dirname, '../build/index.html'),
      })
    );

  isDev && win.webContents.openDevTools();

  // 初始化ipc通信
  // 读取src dir
  ipcMain.on('read-src-dir', (event, dir = []) => {
    const dirs = dialog.showOpenDialogSync(win, {
      title: '选择读取目录',
      defaultPath: dir[0] || 0,
      properties: ['openDirectory', 'showHiddenFiles'],
    });
    event.returnValue = dirs ? dirs : [];
  });
  // 读取target dir
  ipcMain.on('read-target-dir', (event, dir = []) => {
    const dirs = dialog.showOpenDialogSync(win, {
      title: '选择存储目录',
      defaultPath: dir[0] || '',
      properties: ['openDirectory', 'showHiddenFiles'],
    });
    event.returnValue = dirs ? dirs : [];
  });
  // 监听开始、暂停事件
  ipcMain.on(
    'start',
    (event, { src_dir, target_dir, minute, isStart, MUSIC_U, userId }) => {
      if (removeJobs) {
        removeJobs();
        removeJobs = null;
      }
      if (isStart) {
        removeJobs = startCache(src_dir, target_dir, minute, userId, MUSIC_U);
      }
      win.webContents.postMessage('Cache-Message', ['123', '456', '789']);
    }
  );
  // 获取网易云用户信息
  ipcMain.on('get_user', async (event) => {
    let view = new BrowserView();
    let MUSIC_U_DONE = false;
    let userId_DONE = false;
    let MUSIC_U = '';
    let userId = 0;
    function checkResult() {
      if (!MUSIC_U_DONE || !userId_DONE) return;
      if (MUSIC_U && userId) {
        setLocalVals({
          MUSIC_U,
          userId,
        });
        event.returnValue = {
          type: 'success',
          msg: '成功获取到用户信息',
          MUSIC_U,
          userId,
        };
      }
      if (!MUSIC_U) {
        event.returnValue = {
          type: 'error',
          msg: '未能获取到 MUSIC_U 参数，请稍后重试',
        };
      }
      if (!userId) {
        event.returnValue = {
          type: 'error',
          msg: '未能获取到 userId 参数，请稍后重试',
        };
      }
      win.removeBrowserView(view);
      view = null;
    }

    win.setBrowserView(view);
    view.setBounds({ x: 0, y: 45, width: 800, height: 555 });
    view.setAutoResize({ width: true, height: true });
    view.webContents.on('did-navigate-in-page', (e, url, isMf, fpid, frid) => {
      console.log(url, isMf, fpid, frid, 'did-navigate-in-page');
    });
    view.webContents.on('did-redirect-navigation', (e, url) => {
      !MUSIC_U_DONE &&
        view.webContents.session.cookies
          .get({ url: 'https://music.163.com' })
          .then((res) => {
            if (Array.isArray(res)) {
              const cookitItem = res.find((item) => item.name === 'MUSIC_U');
              if (cookitItem) {
                MUSIC_U = cookitItem.value;
                getUserIdFromMUSIC_U(MUSIC_U).then((id) => {
                  userId = id;
                  userId_DONE = true;
                  checkResult();
                });
              }
            }
          })
          .finally(() => {
            MUSIC_U_DONE = true;
            checkResult();
          });
    });
    view.webContents.loadURL('https://music.163.com/#/login');
  });

  // 设置窗口代大小
  ipcMain.on('window:resize', (_e, width, height) => {
    win.setSize(width, height, true);
  });
  ipcMain.on('window:recovery', () => {
    win.setSize(800, 530, true);
  });

  ipcMain.on('rendered', () => {
    console.log('成功渲染');
  });

  win.on('closed', () => {
    win = null;
  });
}

app
  .whenReady()
  .then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .then(() => {
    console.log(`本地数据存储在[${app.getPath('userData')}]下`);
    // new Notification({title: '123', body: '456'}).show()
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
