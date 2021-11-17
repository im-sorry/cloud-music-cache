const { likelist } = require('NeteaseCloudMusicApi');
// e66bd3e3b104d48a9ab533440c32cf8422d78bbdfe963675f909e158ce51b3aa993166e004087dd3d78b6050a17a35e705925a4e6992f61dfe3f0151024f9e31
async function getLikeIdsSet(uid, MUSIC_U) {
  if (!uid || !MUSIC_U) return new Set();
  const respose = await likelist({
    uid,
    cookie: `MUSIC_U=${MUSIC_U}`,
  }).catch(err => {
    console.log(err, 'err');
    return {
      body: {
        ids: [],
      }
    }
  })
  const ids = respose.body.ids;
  return new Set(ids);
}

module.exports = {
  getLikeIdsSet,
}
