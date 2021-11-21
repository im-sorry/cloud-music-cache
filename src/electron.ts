interface MyWindow extends Window {
  electron: {
    ipcRenderer: {
      sendSync: any;
      send: any;
    };
    getLocalVals: () => any;
    setLocalVals: (val: any) => any;
  };
}
const _ = window as unknown as MyWindow;

export default _.electron;
