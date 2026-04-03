const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { startServer } = require("./server");
const Config = require("./config.json");
const Type = require("./type");

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

    Type.blankKeypress(); // to bring up permissions dialogue at start

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(async () => {
    startServer()
        .then((port) => {
            createWindow(port);
        })
        .catch((err) => {
            console.error(err);

            dialog.showErrorBox(
                'CollaboKeys Error',
                err?.message || "Unknown Error"
            );
            process.exit(1);
            return;
        });
    /*try {
        const port = await startServer();
        createWindow(port);
    } catch (err) {
        console.error(err);

        dialog.showErrorBox(
            'CollaboKeys Error',
            err?.message || "Unknown Error"
        );

        return;
    }*/
});

app.on('window-all-closed', () => {
    app.quit();
});