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

/* Declare heavily used functions */

/* Import modules used directly by utils.js */
const os = require("os");

const Config = require("./config.json");
const Variables = require("./variables");
// DO NOT use the logger here as log.js requires utils.js

function escapeHTML(str) { // replace chars that mess up HTML syntax
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>"); // replace newlines
}

function getLocalIP() {
    const networkInterfaces = os.networkInterfaces();
    let localIP = null;
    
    // Iterate over network interfaces to find the non-internal IPv4 address
    Object.keys(networkInterfaces).forEach((ifname) => {
        networkInterfaces[ifname].forEach((iface) => {
            if ('IPv4' !== iface.family || iface.internal !== false) return; // skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            localIP = iface.address;
        });
    });

    return localIP;
}

function formatLog(content, format) {
    if (format === "raw") return `<li>${content}</li>`; // skip formatting & escaping if format is "raw" (not reccomended)

    content = escapeHTML(content);

    switch (format) {
        case "success": case "good":
            content = `<li class="good"><b>${content}</b></li>`; // success logs are always bolded
            break;
        case "error": case "bad":
            content = `<li class="bad"><b>${content}</b></li>`; // error logs are always bolded
            break;
        case "bold":
            content = `<li><b>${content}</b></li>`;
            break;
        default: // if format empty or invalid
            content = `<li>${content}</li>`;
    }

    return content;
}

function sendLog(client, content, format) {
    content = formatLog(content, format);
    client.socket.emit("log", content);
}

function broadcastLog(client, content, format) {
    content = formatLog(content, format);
    client.socket.broadcast.emit("log", content);
}

function sendGlobalLog(content, format) { // to everyone
    if (mainNamespace) {
        content = formatLog(content, format);
        mainNamespace.emit("log", content);
    }
}

// not yet used because of circular dependency issue in log.js:
/*function sendAdminLog(content) {
    if (Config.adminPage.enabled, adminNamespace) {
        adminNamespace.in("admin").emit("log", `<li>${escapeHTML(content)}</li>`);
    }
}*/

function getURI() {
    if (Variables.serverPort === null) return "unknown";

    let localIP;

    if (Config.server.restrictToLocalhost) {
        localIP = "localhost";
    } else {
        localIP = getLocalIP();
        if (localIP === null) return "not reachable";
    }

    const portString = Variables.serverPort === 80 ? "" : ":" + Variables.serverPort;
    
    return "http://" + localIP + portString;  
}

module.exports = { escapeHTML, sendLog, broadcastLog, sendGlobalLog, getURI };