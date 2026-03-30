const { app, BrowserWindow } = require('electron');
const path = require('path');
const { startServer } = require('./server');
const Config = require('./config.json');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // Load the admin page from localhost
    mainWindow.loadURL(`http://localhost:${Config.serverPort}/admin`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    // Start the server
    await startServer();

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});