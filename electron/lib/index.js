const { decodeFile } = require("./transfer");
const fs = require('fs')
const nodeScheduler = require('node-schedule');
const path = require('path')
const copy = require('./copy');
const { getLikeIdsSet } = require('./fetch_like_list');
const { getIdFromFilename, output_like, output, targetPath } = require('./utils');

const 黑名单 = []//['1359156131', '1321602273']

function getOldfiles() {
  const dirs = [output, output_like]
  return dirs.reduce((prev, cur) => {
    prev.push(...fs.readdirSync(cur));
    return prev;
  }, []);
}

async function main() {
  const oldfiles = getOldfiles();
  const existedMusicIdSet = new Set(oldfiles.map(getIdFromFilename).concat(黑名单))
  const files = fs
    .readdirSync(targetPath)
    .filter(filename => /\.uc!?/.test(filename))
    .filter(filename => !existedMusicIdSet.has(filename.split('-')[0]))
  const idsSet = await getLikeIdsSet();

  let chunkSize = 10;
  let waits = [];
  while(files.length >= chunkSize) {
    waits.push(files.splice(0, chunkSize));
  }
  waits.push(files)
  for(let w of waits) {
    await Promise.all(w.map(filename => new Promise(resolve => {
      const isLike = idsSet.has(+(filename.split('-')[0]))
      decodeFile(path.join(targetPath, filename), {
        decodeInfo: 1,
        output: isLike ? output_like : output,
        isLike,
      }).catch(() => {}).finally(resolve)
    })))
  }
  copy();
}
function getNowAt() {
  return Math.floor(Date.now()/1000);
}
let nowAt = getNowAt();
nodeScheduler.scheduleJob('*/5 * * * *', () => {
  const now = getNowAt();
  console.log(`----------------${now-nowAt}s`);
  nowAt = now;
  main();
})