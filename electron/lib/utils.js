const output = "/Users/bytedance/www/open/netease-music-cache-decoder/musics";
const output_like = "/Users/bytedance/www/open/netease-music-cache-decoder/like_musics";
const targetPath = "/Users/bytedance/Library/Containers/com.netease.163music/Data/Caches/online_play_cache";

function getIdFromFilename(filename){
  return filename.split('-').pop().split('.')[0];
}

module.exports = {
  getIdFromFilename,
  output,
  output_like,
  targetPath
}