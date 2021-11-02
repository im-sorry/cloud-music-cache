const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const url = require('url');
const path = require('path')
const startCache = require('./lib');

const env = ((process.argv[2] || '').match(/--env=([A-z]+)/) || ['prod'])[1];
const isDev = env === 'dev';
let job = null;

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  if (isDev)
    win.loadURL('http://localhost:5000');
  else
    win.loadURL(url.format({
      protocol: 'file:',
      slashes: true,
      pathname: path.join(__dirname, 'build/index.html'),
    }))

  isDev && win.webContents.openDevTools();

  // 初始化ipc通信
  // 读取src dir
  ipcMain.on('read-src-dir', (event, dir = []) => {
    const dirs = dialog.showOpenDialogSync(win, {
      title: '选择读取目录',
      defaultPath: dir[0] || 0,
      properties: ['openDirectory', 'showHiddenFiles']
    })
    event.returnValue = dirs;
  });
  // 读取target dir
  ipcMain.on('read-target-dir', (event, dir = []) => {
    const dirs = dialog.showOpenDialogSync(win, {
      title: '选择存储目录',
      defaultPath: dir[0] || '',
      properties: ['openDirectory', 'showHiddenFiles']
    })
    event.returnValue = dirs;
  });
  // 监听开始、暂停事件
  ipcMain.on('start', (event, {
    src_dir,
    target_dir,
    minute,
    isStart
  }) => {
    const MUSIC_U = 'e66bd3e3b104d48a9ab533440c32cf8422d78bbdfe963675f909e158ce51b3aa993166e004087dd3d78b6050a17a35e705925a4e6992f61dfe3f0151024f9e31';
    const uid = 1739402411;
    console.log(src_dir, target_dir, minute, isStart);
    if (job) {
      job.removeAllListeners();
    }
    if (isStart) {
      job = startCache(src_dir, target_dir, minute, uid, MUSIC_U);
    }
  })


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
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  .then(() => {
    // new Notification({title: '123', body: '456'}).show()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
