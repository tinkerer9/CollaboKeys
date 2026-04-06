const { app, BrowserWindow, dialog, powerSaveBlocker } = require("electron");
const path = require("path");
const { startServer } = require("./server");
const { blankKeypress } = require("./type");
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
            devTools: Config.app.enableDevTools
        }
    });

    win.loadFile(path.join(__dirname, "public", "splash", "index.html")); // load splash screen temporarily

    if (Config.app.blankKeypressAtStart) blankKeypress(); // bring up permissions dialog at start

    win.once('ready-to-show', () => {
        win.show()
    });

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(() => {
    if (Config.app.preventDisplaySleep) preventDisplaySleep(); // keep display awake while CollaboKeys is open

    try {
        createWindow(); // create window with splash screen as start

        startServerAndOpen(); // everything server-related happens here
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
    try {
        powerSaveBlocker.start('prevent-display-sleep');
    } catch (err) {
        console.warn("Display sleep preventer failed to start: ", err); // shows warning but still continues
    }
}

async function startServerAndOpen() {
    const startTime = Date.now(); // time in milliseconds since epoch
    
    const port = await startServer(); // start the whole server process here

    const elapsed = Date.now() - startTime; // how long it took to start the server
    const remaining = Math.max(0, Config.app.splashScreenTime - elapsed);

    if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining)); // delay/sleep (async)
    }

    win.loadURL(`http://localhost:${port}/admin`); // actually open the CollaboKeys admin page
}