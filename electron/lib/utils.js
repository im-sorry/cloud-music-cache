const fs = require('fs')
const output = "D:\\download\\musics\\dislike";
const output_like = "D:\\download\\musics\\like";
const targetPath = "C:\\Users\\han\\AppData\\Local\\Netease\\CloudMusic\\Cache\\Cache";

function getIdFromFilename(filename){
  return filename.split('-').pop().split('.')[0];
}
function makeSureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}
module.exports = {
  getIdFromFilename,
  output,
  output_like,
  targetPath,
  makeSureDir,
}