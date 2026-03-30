const { app, BrowserWindow } = require("electron");
const path = require("path");
const { startServer } = require("./server");
const Config = require("./config.json");

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // Load the admin page from localhost
    win.loadURL(`http://localhost:${Config.serverPort}/admin`);

    win.on('closed', () => {
        win = null;
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