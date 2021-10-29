const fs = require('fs')
const { likelist } = require('NeteaseCloudMusicApi');

async function getLikeIdsSet() {
  const respose = await likelist({
    uid: 1739402411,
    cookie: 'MUSIC_U=e66bd3e3b104d48a9ab533440c32cf8422d78bbdfe963675f909e158ce51b3aa993166e004087dd3d78b6050a17a35e705925a4e6992f61dfe3f0151024f9e31',
  }).catch(err => {
    console.log(err, 'err');
  })
  const ids = respose.body.ids;
  fs.writeFileSync('./likelist.json', JSON.stringify(ids, null, 2));
  return new Set(ids);
}

module.exports = {
  getLikeIdsSet,
}
