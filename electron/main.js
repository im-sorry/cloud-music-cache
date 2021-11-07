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

const env = ((process.argv[2] || '').match(/--env=([A-z]+)/) || ['prod'])[1];
const isDev = env === 'dev';
let removeJobs = null;

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (isDev) win.loadURL('http://localhost:5000');
  else
    win.loadURL(
      url.format({
        protocol: 'file:',
        slashes: true,
        pathname: path.join(__dirname, 'build/index.html'),
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
  ipcMain.on('start', (event, { src_dir, target_dir, minute, isStart }) => {
    const MUSIC_U =
      'e66bd3e3b104d48a9ab533440c32cf8422d78bbdfe963675f909e158ce51b3aa993166e004087dd3d78b6050a17a35e705925a4e6992f61dfe3f0151024f9e31';
    const uid = 1739402411;
    if (removeJobs) {
      removeJobs();
      removeJobs = null;
    }
    if (isStart) {
      removeJobs = startCache(src_dir, target_dir, minute, uid, MUSIC_U);
    }
  });
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
        })
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
    }

    win.setBrowserView(view);
    view.setBounds({ x: 0, y: 45, width: 800, height: 555 });
    view.setAutoResize({ width: true, height: true });
    view.webContents.on('did-navigate-in-page', (e, url, isMf, fpid, frid) => {
      console.log(url, isMf, fpid, frid, 'did-navigate-in-page');
    });
    view.webContents.on('did-redirect-navigation', (e, url) => {
      console.log(url, 'did-redirect-navigation');
      !MUSIC_U_DONE &&
        view.webContents.session.cookies
          .get({ url: 'https://music.163.com' })
          .then((res) => {
            if (Array.isArray(res)) {
              const cookitItem = res.find((item) => item.name === 'MUSIC_U');
              if (cookitItem) {
                console.log(cookitItem, 'item');
                MUSIC_U = cookitItem.value;
              }
            }
          })
          .finally(() => {
            MUSIC_U_DONE = true;
            checkResult();
          });
    });
    view.webContents.debugger.attach('1.1');
    view.webContents.debugger.on('message', (e, method, params) => {
      if (userId_DONE) return;
      if (method === 'Network.responseReceived') {
        if (params.response.url.indexOf('/weapi/user/setting') !== -1) {
          let rid = params.requestId;
          console.log(rid, 'rid')
          view.webContents.debugger
            .sendCommand('Network.getResponseBody', { requestId: String(rid) })
            .then((res) => {
              const matched = res.body.match(/"userId":(\d+),/);
              if (matched && matched[1]) userId = matched[1];
            })
            .catch((err) => {
              console.log(err, 'err');
            })
            .finally(() => {
              userId_DONE = true;
              checkResult();
            });
        }
      }
    });
    view.webContents.loadURL('https://music.163.com/#/login');
    view.webContents.debugger.sendCommand('Network.enable');
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
    console.log(`本地数据存储在[${app.getPath('userData')}]下`)
    // new Notification({title: '123', body: '456'}).show()
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
