const electron = require('electron')
const { app, BrowserWindow } = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        fullscreen: true,
        height: 800,
        width: 600,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    //remove menu bar (even Alt key)
    win.removeMenu(true)

    win.loadFile('path\\startup.html')

    win.webContents.openDevTools()
}

app.whenReady().then(createWindow)