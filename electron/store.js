const Store = require('electron-store');
const JsYaml = require('js-yaml');
const os = require('os');
const { isWindows, checkDirUseful } = require('./utils');

const StorageKey = '_cloud_cache_storage_key';

const store = new Store({
  fileExtension: 'yaml',
  serialize: JsYaml.dump,
  deserialize: JsYaml.load,
});

const getDefaultSrcDir = () => {
  const src_dir = isWindows
    ? `${os.homedir()}\\AppData\\Local\\Netease\\CloudMusic\\Cache\\Cache`
    : `${os.homedir()}/Library/Containers/com.netease.163music/Data/Caches/online_play_cache`;
  if (!checkDirUseful(src_dir)) return '';
  return src_dir;
}

const defaultStore = {
  src_dir: getDefaultSrcDir(),
  target_dir: '',
  minute: 5,
}

const getLocalVals = () => {
  let { src_dir, target_dir, minute } = store.get(StorageKey, defaultStore);
  if (src_dir && !checkDirUseful(src_dir)) src_dir = '';
  else src_dir = defaultStore.src_dir;
  if (target_dir && !checkDirUseful(target_dir)) target_dir = '';
  else target_dir = defaultStore.target_dir;
  return {
    src_dir,
    target_dir,
    minute
  }
}

const setLocalVals = valsJson => {
  const localVals = getLocalVals();
  store.set(StorageKey, Object.assign({}, localVals, valsJson));
}

module.exports = {
  getLocalVals,
  setLocalVals,
}
