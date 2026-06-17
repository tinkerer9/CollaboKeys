/*!
 *  CollaboKeys: a collaborative keyboard game
 *  Copyright (C) 2026  @tinkerer9 and @LethalShadowFlame
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* Runs the Electron app. */

const { app, BrowserWindow, dialog, powerSaveBlocker, systemPreferences } = require("electron");

// declare global variables before other modules use them
const Variables = require("./variables");
Variables.electronPackaged = app.isPackaged;
Variables.userDataPath = app.isPackaged ? app.getPath('userData') : ".";

const path = require("path");
const { startServer } = require("./server");
const Config = require("./config.json");
const { logger } = require("./log");

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

    win.once('ready-to-show', () => {
        win.show();

        if (!systemPreferences.isTrustedAccessibilityClient(false)) { // no popup
            setTimeout(() => { // popup behind window otherwise
                systemPreferences.isTrustedAccessibilityClient(true); // ensure CollaboKeys can emulate keypresses
            }, 1000);
        }
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

    if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining)); // delay/sleep (async)

    win.loadURL(`http://localhost:${port}/admin`); // actually open the CollaboKeys admin page


    if (!systemPreferences.isTrustedAccessibilityClient(false)) { // no popup
        setTimeout(() => { // popup behind window otherwise
            systemPreferences.isTrustedAccessibilityClient(true); // ensure CollaboKeys can emulate keypresses
        }, 500);
    }
}