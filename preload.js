const { ipcRenderer, contextBridge } = require('electron');
contextBridge.exposeInMainWorld('ipc', {
    send: ipcRenderer.send,
    on: (l, f) => {
        ipcRenderer.on(l, (e, ...a) => f(...a));
    },
    once: (l, f) => {
        ipcRenderer.once(l, (e, ...a) => f(...a));
    }
})