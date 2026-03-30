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

/* This is the main JavaScript file that runs on the host's computer. */

/* Import modules used directly by server.js */
const { Server } = require("socket.io");

/* Import other scripts we made to organize functions and more: (have other modules as well) */
const Client = require("./client");
const Key = require("./key");
const Type = require("./type");
const Console = require("./console");
const Manager = require("./manager");
const Router = require("./router");
const Config = require("./config.json");
const License = require("./license");
const Utils = require("./utils");

const { sendLog, broadcastLog, sendGlobalLog, log } = Utils; // make frequently used utils.js functions global

function handleNameRes(player, ev) {
    switch (ev) {
        case 0: // valid name entered
            log(`Client ${player.id} name set to ${player.getName()}.`);
            sendLog(player, "Successfully set name to "  + player.getName() + ".", "success");
            player.socket.emit("actions","hideusernamebox");
            break;
        case 1: // name too short
            sendLog(player, "Could not set name: Your name must be more than 3 characters long.", "error");
            break;
        case 2: // name too long
            sendLog(player, "Could not set name: Your name must be shorter than 20 characters long.", "error");
            break;
    }
}

function handleAuthRes(admin, data, override) {
    if (data === Config.adminPage.password || override) { // correct password entered OR no password needed (override)
        admin.authenticate();
        if (override) {
            log(`Admin ${admin.id} automatically authenticated.`);
        } else {
            log(`Admin ${admin.id} successfully authenticated.`);
        }
        sendLog(admin, "Successfully authenticated.", "success");
        admin.socket.emit("actions","hidepasswordbox");
        admin.socket.join("admin"); // add to admins room (only for authenticated admins)
    } else { // incorrect password entered
        sendLog(admin, "Incorrect password entered.", "error");
    }
}

console.log(License.terminalNotice); // log GNU GPLv3 terminal notice

const server = Router.createServer();
const io = new Server(server);
Utils.setIoApp(io);

io.on("connection", (socket) => { // new client connected (non-admin)
    let player = new Client.Player(socket); // create player class
    const pid = player.id;
    Manager.addPlayer(pid, player);

    log(`Player ${pid} connected.`);

    socket.emit("id", pid);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    });

    socket.on("keyPress", (data) => {
        Type.handleKeyPress(socket, player, data);
    });

    socket.on("disconnect", () => { // client disconnected
        log(player.noNameSet() ? `Player ${pid} disconnected.` : `${player.getName()} (player ${pid}) disconnected.`);
        player.destroy();
        player = null; // prepare player class for JS garbage collection
        Key.freeAssignment(pid);
        Manager.removePlayer(pid);
    });
});

const admin = io.of("/admin"); // creates a namespace for just /admin
Utils.setAdminNamespace(admin);

admin.on("connection", (socket) => {
    if (!Config.adminPage.enabled) { // reject connections if admin page disabled
        socket.emit("noAdmin");
        socket.disconnect(); // disconnect the admin
        return;
    }

    let admin = new Client.Admin(socket); // create admin class
    const aid = admin.id;

    log(`Admin ${aid} connected.`);

    if (Config.adminPage.password === "") handleAuthRes(admin, null, true); // auto auth if password is blank

    if (Config.adminPage.autoAuthHost) { // auto auth if client is on server device (optional in config.json)
        const clientIP = socket.handshake.address;
        const isLocal = clientIP === "127.0.0.1" || clientIP === "::1" || clientIP === "::ffff:127.0.0.1";

        if (isLocal) handleAuthRes(admin, null, true); // auto auth
    }

    socket.on("authenticate", (data) => {
        if (admin.authenticated) return;

        handleAuthRes(admin, data, false);
    });

    socket.on("command", (data) => {
        if (!admin.authenticated) return;

        let response = Console.handleCommand(data) // handle command as if typed into console
        socket.emit("response", `<li><b>${data}:</b><br>${response}</li>`);
    });

    socket.on("disconnect", () => { // admin disconnected
        log(`Admin ${aid} disconnected.`);
        admin.destroy();
        admin = null; // prepare admin class for JS garbage collection
    });
});

function startServer() {
    return new Promise((resolve) => {
        const serverPort = Config.serverPort;
        const allowedIPs = Config.restrictToLocalhost ? "127.0.0.1" : "0.0.0.0"; // 127.0.0.1 = localhost only, 0.0.0.0 = everyone
        server.listen(serverPort, allowedIPs, () => {
            let localIP = Utils.getLocalIP();
            let portString = serverPort === 80 ? "" : ":" + serverPort;
            let uri = "http://" + localIP + portString; // assuming HTTP

            let logText = "";

            logText += `Server running at ${uri}\n`;
            if (Config.adminPage.enabled) logText += `Admin controls at ${uri}/admin\n`;
            // add other links here...

            log(logText);
            resolve();
        });
    });
}

if (require.main === module) {
    startServer();
}

module.exports = { startServer };
