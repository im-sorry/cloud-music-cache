const fs = require('fs');

// dir是绝对路径
function checkDirUseful(dir) {
  if (!dir) return false;
  if (!fs.existsSync(dir)) return false;
  return true;
}

module.exports = {
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  checkDirUseful,
}