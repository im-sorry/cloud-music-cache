const { decodeFile } = require("./transfer");
const fs = require('fs')
const nodeScheduler = require('node-schedule');
const path = require('path')
const copy = require('./copy');
const { getLikeIdsSet } = require('./fetch_like_list');
const { getIdFromFilename, makeSureDir } = require('./utils');

const 黑名单 = []//['1359156131', '1321602273']

function getOldfiles(output, output_like) {
  const dirs = [output, output_like]
  return dirs.reduce((prev, cur) => {
    prev.push(...fs.readdirSync(cur));
    return prev;
  }, []);
}

async function main(output, output_like, src_dir, uid, MUSIC_U) {
  makeSureDir(output);
  makeSureDir(output_like);
  const oldfiles = getOldfiles(output, output_like);
  const existedMusicIdSet = new Set(oldfiles.map(getIdFromFilename).concat(黑名单))
  const files = fs
    .readdirSync(src_dir)
    .filter(filename => /\.uc!?/.test(filename))
    .filter(filename => !existedMusicIdSet.has(filename.split('-')[0]))
  const idsSet = await getLikeIdsSet(uid, MUSIC_U);

  let chunkSize = 10;
  let waits = [];
  while(files.length >= chunkSize) {
    waits.push(files.splice(0, chunkSize));
  }
  waits.push(files)
  for(let w of waits) {
    await Promise.all(w.map(filename => new Promise(resolve => {
      const isLike = idsSet.has(+(filename.split('-')[0]))
      decodeFile(path.join(src_dir, filename), {
        decodeInfo: 1,
        output: isLike ? output_like : output,
        isLike,
      }).catch(() => {}).finally(resolve)
    })))
  }
  copy(output, output_like, uid, MUSIC_U);
}
function getNowAt() {
  return Math.floor(Date.now()/1000);
}

function startCache(src_dir, target_dir, minute, uid, MUSIC_U) {
  let nowAt = getNowAt();
  return nodeScheduler.scheduleJob(`*/${minute} * * * *`, () => {
    const now = getNowAt();
    console.log(`----------------${now-nowAt}s`);
    nowAt = now;
    main(path.join(target_dir, 'dislike'), path.join(target_dir, 'like'), src_dir, uid, MUSIC_U);
  })
}

module.exports = startCache;
