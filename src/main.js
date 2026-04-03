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
            devTools: false
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
        const startTime = Date.now();
        const port = await startServer();

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1000 - elapsed); // change the 1000 for how many times you want to have the splash screen on (ms)

        if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
        }

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