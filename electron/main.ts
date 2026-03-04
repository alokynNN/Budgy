import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

const DATA_PATH = path.join(app.getPath('userData'), 'budget-data.json')

// File operations
function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = fs.readFileSync(DATA_PATH, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
  return null
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 700,
    height: 500,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    splashWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/splash`)
  } else {
    splashWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/splash',
    })
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    frame: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close()
        splashWindow = null
      }
      if (mainWindow) {
        mainWindow.show()
      }
    }, 2500)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createSplashWindow()
  createMainWindow()

  // Window controls
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
  })

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close()
  })

  // File operations
  ipcMain.handle('save-data', async (_, data) => {
    saveData(data)
  })

  ipcMain.handle('load-data', async () => {
    return loadData()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})