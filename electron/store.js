const Store = require('electron-store');
const JsYaml = require('js-yaml');
const os = require('os');
const { isWindows, checkDirUseful } = require('./utils');

const StorageKey = '_cloud_cache_storage_key';

const getDefaultSrcDir = () => {
  const src_dir = isWindows
    ? `${os.homedir()}\\AppData\\Local\\Netease\\CloudMusic\\Cache\\Cache`
    : `${os.homedir()}/Library/Containers/com.netease.163music/Data/Caches/online_play_cache`;
  if (!checkDirUseful(src_dir)) return '';
  return src_dir;
};

const defaultStore = {
  src_dir: getDefaultSrcDir(),
  target_dir: '',
  minute: 5,
  MUSIC_U: '',
  userId: '',
  diff: false,
};

const store = new Store({
  fileExtension: 'yaml',
  serialize: JsYaml.dump,
  deserialize: JsYaml.load,
  defaults: defaultStore,
});

const getLocalVals = () => {
  let {
    src_dir,
    target_dir,
    minute,
    MUSIC_U = '',
    userId = 0,
    diff = false,
  } = store.get(StorageKey, defaultStore);
  if (!src_dir) src_dir = defaultStore.src_dir;
  else if (!checkDirUseful(src_dir)) src_dir = '';
  if (!target_dir) target_dir = defaultStore.target_dir;
  else if (!checkDirUseful(target_dir)) target_dir = '';
  return {
    src_dir,
    target_dir,
    minute,
    MUSIC_U,
    userId,
    diff,
  };
};

const setLocalVals = (valsJson) => {
  const localVals = getLocalVals();
  const newVals = Object.assign({}, localVals, valsJson);
  store.set(StorageKey, newVals);
};

const resetLocalVals = () => store.clear();

module.exports = {
  getLocalVals,
  setLocalVals,
  resetLocalVals,
};
