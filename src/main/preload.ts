// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example' // Added functionality
  | 'send-library' // Added functionality
  | 'epub-coverart'
  | 'epub-text'
  | 'library-sort' // Added functionality
  | 'update-library' // Added functionality
  | 'add-new-book' // Added functionality
  | 'get-book-content'
  | 'delete-book' // Added WIP
  | 'find-in-explorer' // Added WIP
  | 'get-book-library'
  | 'add-tag' // Added WIP
  | 'remove-tag'; // Added WIP

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
