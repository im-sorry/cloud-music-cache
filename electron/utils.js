const fs = require('fs');
const { user_account } = require('NeteaseCloudMusicApi');

// dir是绝对路径
function checkDirUseful(dir) {
  if (!dir) return false;
  if (!fs.existsSync(dir)) return false;
  return true;
}

function getUserIdFromMUSIC_U(MUSIC_U) {
  let id = 0;
  if (!MUSIC_U) return Promise.resolve(id);
  return new Promise((resolve) => {
    user_account({
      cookie: `MUSIC_U=${MUSIC_U}`,
    })
      .then((res) => {
        try {
          id = res.body.account.id;
        } catch (error) {}
        resolve(id);
      })
      .catch(() => {
        resolve(id);
      });
  });
}

module.exports = {
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  checkDirUseful,
  getUserIdFromMUSIC_U,
};
