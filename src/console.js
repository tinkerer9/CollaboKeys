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

/* Handles console commands */

const readline = require("readline");

const Manager = require("./manager");
const Type = require("./type");
const Key = require("./key");
const License = require("./license");
const Utils = require("./utils");
const { makeKeycodesTable } = require("./keycodes");
const Config = require("./config.json");
const { logger, logFolderPath } = require("./log");
const Variables = require("./variables");

let logList = []; // log that is sent out to console and admin page

function log(a) {
    logList.push(a);
}

function fallback(args) {
    log("Unrecognized command. Please try again.");
}

function processToLog(player, filter) {
    // Returns true if should print, false if should filter.
    if (player === null) return false;
    switch (filter) {
        case "all":
            return true;
        case "wr":
            return player.inWaitingRoom();
        case "active":
            return !player.inWaitingRoom() && !player.noNameSet();
        case "nameless":
            return player.noNameSet();
        default:
            // Invalid filter
            return false;
    }
}

function echo(args) {
    log(args.join(" "));
}

function endRl(args) {
    // stop
    
    log("Ending process.");

    rl.close();
    process.exit();
}

function waitingRoom(args) {
    // waitingroom <admit/dismiss> <id/all>

    let action = args[0] || null;
    let pid = args[1] || null;
    if (pid === "all") pid = -1;

    // Check if allowed
    if (action === null) {
        log("You need to provide more arguments (action)! Usage: waitingroom <admit/dismiss> <id>");
        return;
    }
    if (pid !== -1 && !Manager.isPlayer(pid)) {
        log("Invalid player, did you mistype the id?");
        return;
    };

    // Setup more vars now that check has passed
    let players = pid === -1 ? Manager.getAllPlayers() : [ Manager.getPlayerByPid(pid) ];

    // Use switch statement so if more options added later they'll be easier to implement
    switch (action) {
        case "admit": case "a":
            players.forEach(player => {
                player.admit();
                player.message("You have been admitted from the waiting room.");
                log(player.noNameSet ? `Admitted player #${player.id}.` : `Admitted ${player.name} (#${player.id}).`);
            });
            break;
        case "dismiss": case "d":
            players.forEach(player => {
                player.dismiss();
                player.message("You have been dismissed to the waiting room.");
                log(player.noNameSet ? `Dismissed player #${player.id}.` : `Dismissed ${player.name} (#${player.id}).`);
            });
            break;
        default:
            log("Invalid method, did you misspell the first argument?");
            return;
    }
};

function disable(args) {
    // disable <emulation/reservation>

    const type = args[0] || null;
    
    switch (type) {
        case "emulation": case "e":
            Variables.allowEmulation = false;
            log("Emulation disabled.");
            break;
        case "reservation": case "r":
            Variables.allowReservation = false;
            log("Auto-reservation disabled.");
            break;
        default:
            log("You need to provide more arguments (type)! Usage: disable <emulation/reservation>");
    }
}

function enable(args) {
    // enable <emulation/reservation>

    const type = args[0] || null;
    
    switch (type) {
        case "emulation": case "e":
            Variables.allowEmulation = true;
            log("Emulation enabled.");
            break;
        case "reservation": case "r":
            Variables.allowReservation = true;
            log("Key reservation enabled.");
            break;
        default:
            log("You need to provide more arguments (type)! Usage: enable <emulation/reservation>");
    }
}

function listHandle(args) {
    // list <active/wr/waitingroom/all/nameless>

    // Setup vars
    let filterBy = args[0] || "all";
    if (filterBy === "waitingroom") filterBy = "wr";
    
    let showWait = filterBy !== "wr";

    let numPlayers = Manager.getPlayerCount();

    if (numPlayers === 0) {
        log("No players connected");
        return;
    }

    Manager.getAllPlayers().forEach((player, index) => {
        if (!processToLog(player, filterBy)) return;
        log(player.noNameSet() ? `player #${player.id}:` : `${player.name} (#${player.id}):`);
        log(player.socket.handshake.address);
        log(`Assigned Keys: ${Key.getReservedKeysString(player.id)}`);
        if (showWait && player.waitingRoom) log("In waiting room");
        if (index !== numPlayers - 1) log("---");
    });
};

function actionCallback(key, oneF, oneM, twoF, twoM) {
    if (key === "all") {
        oneF();
        log(oneM);
    } else {
        twoF(key);
        log(twoM);
    }
}

function keyHandle(args) {
    // key <assign/revoke/enable/disable> <name/all>

    let action = args[0] || null;
    let key = args[1] || null;

    if (action === null) {
        log("You need to provide more arguments (action)! Usage: key <assign/revoke/enable/disable> <name/all>");
        return;
    }
    if (key !== "all" && (key === null || !Type.keyExists(key))) {
        log("Invalid key, did you mistype the key name?");
        return;
    };

    switch (action) {
        case "assign": case "a":
            actionCallback(
                key,
                ()=>{}, 
                `You don't want to do that.`,
                ()=>{},
                `Ask the player to press the key once. If it's reserved, use "key revoke ${key}"`,
            );

            break;
        case "revoke": case "r":
            actionCallback(
                key,
                Key.revokeAllKeys, 
                `Reset all keys.`,
                Key.revokeKey,
                `${key} revoked from all players.`,
            );

            break;
        case "enable": case "e":
            actionCallback(
                key,
                Type.enableAllKeys, 
                `All keys enabled.`,
                Type.enableKey,
                `${key} enabled.`,
            );

            break;
        case "disable": case "d":
            actionCallback(
                key,
                Type.disableAllKeys, 
                `All keys disabled.`,
                Type.disableKey,
                `${key} disabled.`,
            );

            break;
        default:
            log("Invalid method, did you misspell the first argument?");
            return;
    }
}

function licenseInfo(args) {
    let type = args[0] || null;

    if (type === null) {
        log("You need to provide more arguments (type)! Usage: show <w/c>");
        return;
    }
    
    switch (type) {
        case "w": case "warranty":
            log(License.warrantyInfo);
            log(`You can also visit ${Utils.getURI()}/warranty to see this text.`);
            break;
        case "c": case "license": case "full":
            log(License.licenseInfo);
            log(`You can also visit ${Utils.getURI()}/license to see this text.`);
            break;
        default:
            log("Invalid method, did you misspell the first argument?");
            return;
    }
}

function printURI(args) {
    log(Utils.getURI());
}

function printKeycodes(args) {
    log(makeKeycodesTable());
    log(`You can also visit ${Utils.getURI()}/keycodes to see this table.`);
}

function showLogs(args) {
    let type = args[0] || "combined";

    log(`Please go to ${logFolderPath}/${type}.log on the host filesystem to see logs.`);
    log(`You can also visit ${Utils.getURI()}/logs${type === "combined" ? "" : `/${type}`}.`);
}

function press(args) {
    let key = args[0] || null;

    if (key === null) {
        log("You need to provide more arguments (key)! Usage: press <key>");
        return;
    }

    log(Type.testKeypress(key));
}

function commandCallbacks(cmd) {
    switch (cmd) { // No breaks needed, the return stops the function.
        case "echo":
            return echo;
        case "stop": case "exit": case "quit":
            return endRl;
        case "waitingroom": case "wr":
            return waitingRoom;
        case "list": case "ls":
            return listHandle;
        case "key": case "k":
            return keyHandle;
        case "disable": case "d":
            return disable;
        case "enable": case "e":
            return enable;
        case "show": case "s":
            return licenseInfo;
        case "uri": case "ip":
            return printURI;
        case "keycodes": case "kc": // console only
            return printKeycodes;
        case "logs": case "l":
            return showLogs;
        case "press": case "type":
            return press;
        default:
            return fallback;
    }
}

function handleCommand(input) {
    logList = []; // reset log

    const words = [...input.matchAll(/'([^']*)'|"([^"]*)"|(\S+)/g)] // strip quotes
        .map(m => m[1] ?? m[2] ?? m[3]);

    if (!words.length) return; // if command empty

    commandCallbacks(words[0])(words.slice(1)); // run command

    let logText = logList.join('\n'); // join log lines together into one string

    console.log(`${input}:\n${logText}\n`);
    logger.verbose(`Console command "${input}" ran with response:\n${logText}\n`);

    return Utils.escapeHTML(logText); // for admin page (cleaned up for HTML)
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('SIGINT', endRl); // Control + C pressed
rl.on('SIGTERM', endRl); // terminal closed

if (Config.console.enabled) rl.on('line', handleCommand);

module.exports = { handleCommand }; // for admin page