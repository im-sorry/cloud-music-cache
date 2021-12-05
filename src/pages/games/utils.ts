import electron from '../../electron';

export const resizeWindow = (width: number, height: number) => {
  electron.ipcRenderer.send('window:resize', width, height);
  return () => {
    electron.ipcRenderer.send('window:recovery');
  };
};
