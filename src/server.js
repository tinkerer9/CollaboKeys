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
const Type = require("./type");
const Console = require("./console");
const Router = require("./router");
const Config = require("./config.json");
const License = require("./license");
const Utils = require("./utils");
const Variables = require("./variables");
const { logger, addAdminPageTransport } = require("./log");

const { sendLog, broadcastLog } = Utils; // make frequently used utils.js functions global

function handleNameRes(player, ev) {
    switch (ev) {
        case 0: // valid name entered
            logger.info(`Client #${player.id} name set to ${player.name}.`);
            sendLog(player, `Successfully set name to ${player.name}.`, "good");
            player.socket.emit("nameset");
            break;
        case 1: // name too short
            sendLog(player, "*Could not set name:* Your name must be more than 3 characters long.", "bad");
            break;
        case 2: // name too long
            sendLog(player, "*Could not set name:* Your name must be shorter than 20 characters long.", "bad");
            break;
    }
}

function handleAuthRes(admin, data, override) {
    if (data === Config.adminPage.password || override) { // correct password entered OR no password needed (override)
        admin.authenticate();
        if (override) {
            logger.info(`Admin #${admin.id} automatically authenticated.`);
           sendLog(admin, "Automatically authenticated.", "good");

        } else {
            logger.info(`Admin #${admin.id} successfully authenticated.`);
            sendLog(admin, "Successfully authenticated.", "good");
        }
        admin.socket.emit("authenticated");
        admin.socket.join("admin"); // add to admins room (only for authenticated admins)
    } else { // incorrect password entered
        sendLog(admin, "Incorrect password entered.", "bad");
    }
}

console.log(License.terminalNotice); // log GNU GPLv3 terminal notice, not to Winston

const server = Router.createServer();
const io = new Server(server);
const admin = io.of("/admin"); // creates a namespace for just /admin

Variables.mainNamespace = io;
Variables.adminNamespace = admin;
addAdminPageTransport(admin);

io.on("connection", (socket) => { // new client connected (non-admin)
    let player = new Client.Player(socket); // create player class
    const id = player.id;

    logger.http(`Player #${id} connected.`);

    socket.emit("id", id);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    });

    socket.on("keydown", (key) => {
        Type.handleKeydown(player, key);
    });
    socket.on("keyup", (key) => {
        Type.handleKeyup(player, key);
    });

    socket.on("disconnect", () => { // client disconnected
        logger.http(player.noNameSet() ? `Player #${id} disconnected.` : `${player.name} (player #${id}) disconnected.`);
        player.destroy();
        player = null; // prepare player class for JS garbage collection
    });
});

admin.on("connection", (socket) => {
    if (!Config.adminPage.enabled) { // reject connections if admin page disabled
        socket.emit("noAdmin");
        socket.disconnect(); // disconnect the admin
        return;
    }

    let admin = new Client.Admin(socket); // create admin class
    const id = admin.id;

    logger.http(`Admin #${id} connected.`);

    if (Config.adminPage.password === "") {
        handleAuthRes(admin, null, true); // auto auth if password is blank
    } else if (Config.adminPage.autoAuthHost) { // auto auth if client is on server device (optional in config.json)
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
        socket.emit("response", data, response);
    });

    socket.on("disconnect", () => { // admin disconnected
        logger.http(`Admin #${id} disconnected.`);
        admin.destroy();
        admin = null; // prepare admin class for JS garbage collection
    });
});

function startServer() {
    logger.info("Starting server...\n");
    
    const bindHost = Config.server.restrictToLocalhost ? "127.0.0.1" : "0.0.0.0";
    const ports = [...Config.server.ports, 0]; // add port 0 (random)
    let index = 0;

    return new Promise((resolve, reject) => {
        function attempt() {
            if (index >= ports.length) {
                reject(new Error("No available ports"));
                return;
            }

            const port = ports[index++];

            const onError = (err) => {
                if (err.code === "EADDRINUSE") {
                    attempt();
                } else {
                    reject(err);
                }
            };

            server.once("error", onError);

            server.listen(port, bindHost, () => {
                server.off("error", onError);

                const usedPort = server.address().port;
                resolve(usedPort);
            });
        }

        attempt();
    }).then((usedPort) => {
        Variables.serverPort = usedPort;

        const uri = Utils.getURI();
        
        let logText = `Server running at ${uri}\n`;
        if (Config.adminPage.enabled) logText += `Admin controls at ${uri}/admin\n`;
        
        logger.info(logText);
        return usedPort;
    });
}

if (require.main === module) {
    startServer()
        .then()
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });
}

module.exports = { startServer };