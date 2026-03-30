const { app, BrowserWindow } = require("electron");
const path = require("path");
const { startServer } = require("./server");
const Config = require("./config.json");

let win;

function createWindow(port) {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // Load the admin page from localhost
    win.loadURL(`http://localhost:${port}/admin`);

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(async () => {
    startServer().then(port => {
        createWindow(port);
    });
});

app.on('window-all-closed', () => {
    app.quit();
});