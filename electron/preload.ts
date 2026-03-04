import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // File operations
  saveData: (data: any) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
})

declare global {
  interface Window {
    electron: {
      minimize: () => void
      maximize: () => void
      close: () => void
      saveData: (data: any) => Promise<void>
      loadData: () => Promise<any>
    }
  }
}