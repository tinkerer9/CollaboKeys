const { app, BrowserWindow, dialog } = require("electron");
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
    try {
        const port = await startServer();
        createWindow(port);
    } catch (err) {
        console.error(err);

        dialog.showErrorBox(
            'CollaboKeys Error',
            err?.message || "Unknown"
        );

        return;
    }
});

app.on('window-all-closed', () => {
    app.quit();
});