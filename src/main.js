const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { startServer } = require("./server");
const Type = require("./type");

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: "#171717", // middle of gradient applied by CSS
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // Load the admin page from localhost
    win.loadFile(path.join(__dirname, "public", "splash", "index.html"));

    Type.blankKeypress(); // to bring up permissions dialogue at start

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(async () => {
    createWindow();

    try {
        const port = await startServer();
        await new Promise((resolve) => setTimeout(resolve, 1000)); // flash splash screen
        win.loadURL(`http://localhost:${port}/admin`);
    } catch (err) {
        console.error(err);
        dialog.showErrorBox( "CollaboKeys Error", err?.message || "Unknown Error" );
        process.exit(1);
    }
});

app.on('window-all-closed', () => {
    app.quit();
});