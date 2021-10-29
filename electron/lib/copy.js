const fs = require('fs')
const path = require('path')
const { getLikeIdsSet } = require('./fetch_like_list');
const { getIdFromFilename, output_like, output, targetPath } = require('./utils');

function getOldFiles(path) {
  return fs.readdirSync(path);
}

async function main() {
  const likeIdSet = await getLikeIdsSet();
  const oldLikeFiles = getOldFiles(output_like);
  const oldLikeFilesSet = new Set(oldLikeFiles.map(getIdFromFilename));
  const oldDislikeFiles = getOldFiles(output);
  const oldDislikeFilesSet = new Set(oldDislikeFiles.map(getIdFromFilename));
  // 从喜欢的里面删除放到不喜欢的里面
  oldLikeFiles.forEach(filename => {
    const id = getIdFromFilename(filename);
    if (likeIdSet.has(+id)) return;
    if (oldDislikeFilesSet.has(id)) {
      fs.unlinkSync(path.join(output_like, filename));
      console.log(`delete like ${filename}`)
      return;
    }
    fs.copyFileSync(path.join(output_like, filename), path.join(output, filename))
    fs.unlinkSync(path.join(output_like, filename));
    console.log(`mv to dislike ${filename}`)
  });

  // 从不喜欢的里面挑出来喜欢的
  oldDislikeFiles.forEach(filename => {
    const id = getIdFromFilename(filename);
    if (!likeIdSet.has(+id)) return;
    if (oldLikeFilesSet.has(id)) {
      fs.unlinkSync(path.join(output, filename));
      console.log(`delete dislike ${filename}`);
      return;
    }
    fs.copyFileSync(path.join(output, filename), path.join(output_like, filename))
    fs.unlinkSync(path.join(output, filename));
    console.log(`mv to like ${filename}`);
  })
}

module.exports = main;
