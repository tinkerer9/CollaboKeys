const { app, BrowserWindow, dialog, powerSaveBlocker } = require("electron");
const path = require("path");
const { startServer } = require("./server");
const Type = require("./type");
const Config = require("./config.json");

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // will be shown once ready
        backgroundColor: "#171717", // middle of gradient applied by CSS
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: false
        }
    });

    win.loadFile(path.join(__dirname, "public", "splash", "index.html")); // load splash screen temporarily

    Type.blankKeypress(); // to bring up permissions dialogue at start

    win.once('ready-to-show', () => {
        win.show()
    });

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(async () => {
    if (Config.preventDisplaySleep) preventDisplaySleep(); // keep display awake while CollaboKeys is open
    createWindow(); // create window with splash screen as start

    try {
        const startTime = Date.now(); // time in milliseconds since epoch
        
        const port = await startServer(); // start the whole server process here

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1000 - elapsed); // change the 1000 for how many times you want to have the splash screen on (ms)

        if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
        }

        win.loadURL(`http://localhost:${port}/admin`); // actually open the CollaboKeys admin page
    } catch (err) {
        console.error(err);
        dialog.showErrorBox( "CollaboKeys Error", err?.message || "Unknown Error" );
        process.exit(1);
    }
});

app.on('window-all-closed', () => {
    app.quit();
});

function preventDisplaySleep() {
    const id = powerSaveBlocker.start('prevent-display-sleep');
    if (!powerSaveBlocker.isStarted(id)) console.warn("Display sleep preventer failed to start.");
    return id;
}