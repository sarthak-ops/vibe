// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Explicitly typing 'ignore' as boolean and 'options' as any (or a specific object)
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => 
    ipcRenderer.send('set-ignore-mouse-events', ignore, options)
});
