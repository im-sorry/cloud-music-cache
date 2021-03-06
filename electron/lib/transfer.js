const fs = require("fs").promises;
const path = require("path");
const { song_detail } = require("NeteaseCloudMusicApi");

const BAZINGA = 0xa3;
const BLOCK_SIZE = 256 * 1024;
const CACHE_EXT = ".uc";
const OUTPUT_EXT = ".mp3";

function decode(buffer) {
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] ^= BAZINGA;
  }
}

async function decodeFile(target, opts) {
  const targetPath = path.resolve(module.parent.path, target);
  const stat = await fs.stat(targetPath);
  if (stat.size <= 0) return;
  const buffer = Buffer.alloc(stat.size);

  const reader = await fs.open(targetPath, "r");
  for (let offset = 0; offset < stat.size; offset += BLOCK_SIZE) {
    const length = offset + BLOCK_SIZE > stat.size ? stat.size - offset : BLOCK_SIZE;
    await reader.read(buffer, offset, length);
  }
  await reader.close();

  decode(buffer);

  if (opts.output) {
    const originName = path.basename(targetPath, CACHE_EXT);
    const filename = opts.decodeInfo ? await decodeInfo(originName, opts.isLike) : originName;
    const outputPath = path.resolve(module.parent.path, opts.output, filename + OUTPUT_EXT);
    const writer = await fs.open(outputPath, "w");
    await writer.write(buffer, 0, stat.size);
    await writer.close();
  }

  return buffer;
}

async function decodeInfo(filename, isLike) {
  const ids = filename.split("-");
  try {
    const rsp = await song_detail({ ids: ids[0] });
    if (rsp.body.songs.length === 0) return filename;
    const song = rsp.body.songs[0];
    let name = song.name.trim() + "-" + song.ar.map((artist) => artist.name.trim()).join("-") + '-' + ids[0];
    name = name.replace(/（/g, '(').replace(/）/g, ')').replace(/ /g, '').replace(/\//g, '')
    console.log(`${isLike ? 'like' : 'dislike'}:${name}`);
    return name;
  } catch (err) {
    return filename;
  }
}

module.exports = {
  decode,
  decodeFile,
  decodeInfo,
};
