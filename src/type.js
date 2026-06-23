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

/* This script manages the keyboard emulation on the host's computer. */

const Config = require("./config.json");
const { keycodes } = require("./keycodes"); // a list of keynames, their keycodes, human-readable names, and enabled/disabled
const Utils = require("./utils");
const Key = require("./key");
const { logger } = require("./log");
const Variables = require("./variables");
const { KeyboardHelper } = require("./emulate/keyboard");

const { sendLog, broadcastLog } = Utils; // make frequently used utils.js functions global

const keyboard = new KeyboardHelper();

let keypressesThisMinute = 0;

function stopKeyboard() {
    keyboard.stop();
}

function keyExists(key) {
    return key in keycodes;
}

function keyEnabled(key) {
    return keycodes[key][2];
}

function enableKey(key) {
    keycodes[key][2] = true;
}
function disableKey(key) {
    keycodes[key][2] = false;
}
function enableAllKeys() {
    Object.keys(keycodes).forEach(key => {
        enableKey(key);
    });
}
function disableAllKeys() {
    Object.keys(keycodes).forEach(key => {
        disableKey(key);
    });
}

function getKeyName(key) {
    return keycodes[key][1];
}

function testKeypress(key, type) { // for console command
    if (!keyExists(key)) return `'${key}' is not supported.`
    let keyName = getKeyName(key);

    let typed = "";

    switch (type) {
        case "down":
            keyboard.down(keycodes[key][0]);
            typed = "pushed";
            break;
        case "up":
            keyboard.up(keycodes[key][0]);
            typed = "released";
            break;
        default: // press
            keyboard.press(keycodes[key][0]);
            typed = "pressed";
            break;
    }

    return key === keyName ? `'${key}' ${typed}.` : `'${key}' (${keyName}) ${typed}.`;
}

function canType(player, key, down) {
    // if down = false (used for checking keyups), have looser checks

    if (!player.canType()) return false; // waitroomed or unnamed

    if (!Variables.allowEmulation && down) {
        sendLog(player, "Emulation is disabled by admin.", "bad"); // send to player
        return false;
    }

    if (Config.maxKeypressesPerMinute !== 0 && keypressesThisMinute >= Config.maxKeypressesPerMinute && down) {
        const secondsLeft = 60 - new Date().getSeconds();
        sendLog(player, `The global keypress limit has been reached. Please wait ${secondsLeft} seconds.`, "bad"); // send to player
        return false;
    }

    if (!keyExists(key)) {
        sendLog(player, `${key} is not supported.`, "bad"); // send to player
        return false;
    }

    const keyName = getKeyName(key);

    if (!keyEnabled(key) && down) {
        sendLog(player, `${keyName} is disabled by admin.`, "bad"); // send to player
        return false;
    }

    const [keyAllowed, keyNew] = Key.keyAllowed(key, player.id); 

    if (!keyAllowed) {
        if (keyNew) { // reservation disabled
            sendLog(player, `Auto-reservation is disabled by admin.`, "bad"); // send to player
        } else { // key already reserved
            sendLog(player, `${keyName} is already reserved.`, "bad"); // send to player
        }
        return false;
    }

    if (Config.player.maxReservedKeys > 0 && down) { // 0 = no limit
        if (Key.keyCount(player.id) > Config.player.maxReservedKeys) {
            sendLog(player, `You can't reserve any more keys.`, "bad")
            return false;
        }
    }

    return true;
}

function handleKeydown(player, key) {
    if (!canType(player, key, true)) return;

    const keyName = getKeyName(key);
    const keyNew = Key.keyAllowed(key, player.id)[1]; 

    keypressesThisMinute++;

    if (keyNew) player.socket.emit("keyReserved", keyName);

    sendLog(player, `You pressed ${keyName}.`, "bold"); // send to player
    broadcastLog(player, `${player.name} pressed ${keyName}.`); // send to other clients

    keyboard.down(keycodes[key][0]); // emulate keypress
}

function handleKeyup(player, key) {
    if (!canType(player, key, false)) return;

    keyboard.up(keycodes[key][0]); // emulate keypress
}

// reset keypressesThisMinute every clock minute
const msUntilNextMinute = 60000 - (Date.now() % 60000);
setTimeout(() => {
    keypressesThisMinute = 0;
    setInterval(() => keypressesThisMinute = 0, 60000);
}, msUntilNextMinute);

module.exports = { stopKeyboard, testKeypress, handleKeydown, handleKeyup, keyExists, enableKey, disableKey, enableAllKeys, disableAllKeys };