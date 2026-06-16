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

const { exec } = require("child_process");

const Config = require("./config.json");
const { keycodes } = require("./keycodes"); // a list of keynames, their keycodes, human-readable names, and enabled/disabled
const Utils = require("./utils");
const Key = require("./key");
const { logger } = require("./log");
const Variables = require("./variables");

const { sendLog, broadcastLog, sendGlobalLog, log } = Utils; // make frequently used utils.js functions global

let allowEmulation = Config.allowEmulationAtStart;

if (process.platform !== 'darwin') {
    console.warn("WARNING: CollaboKeys won't emulate on operating systems other than MacOS. Disabling emulation...");
}

function keyExists(key) {
    return key in keycodes;
}

function keyEnabled(key) {
    return keycodes[key][3];
}

function enableKey(key) {
    keycodes[key][3] = true;
}
function disableKey(key) {
    keycodes[key][3] = false;
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

function keypress(key) {
    if (process.platform !== 'darwin') return; // disable emulation if not on MacOS

    let [keycode,, needsShift] = keycodes[key]; // get key info

    exec(`osascript -e 'tell application "System Events" to key code ${keycode}${needsShift ? " using shift down" : ""}'`, (err) => {
        if (err) logger.warn("Error emulating keypress: ", err);
    }); // run shell script to emulate keypress (SLOW)
}

function testKeypress(key) { // for console command
    if (!keyExists(key)) return `'${key}' is not supported.`

    let keyName = getKeyName(key);

    if (!keyEnabled(key)) return `${keyName} is disabled by admin.`;

    keypress(key); // emulate keypress

    return key === keyName ? `'${key}' pressed.` : `'${key}' (${keyName}) pressed.`;
}

function handleKeyPress(socket, player, data) {
    if (!allowEmulation) {
        sendLog(player, "Emulation is disabled by admin.", "error"); // send to player
        return;
    }

    if (!player.canType()) return; // only allows players that are named and not waitroomed to press keys

    let keyData = data.key;

    if (!keyExists(keyData)) {
        sendLog(player, `${keyData} is not supported.`, "error"); // send to player
        return;
    }

    let keyName = getKeyName(keyData);

    if (!keyEnabled(keyData)) {
        sendLog(player, `${keyName} is disabled by admin.`, "error"); // send to player
        return;
    }

    let [keyAllowed, keyNew] = Key.keyAllowed(keyData, player.id); 

    if (!keyAllowed) { // if key already assigned
        sendLog(player, `${keyName} is already reserved.`, "error"); // send to player
        return;
    }

    if (Config.player.maxReservedKeys > 0) { // 0 = no limit
        if (Key.keyCount(player.id) > Config.player.maxReservedKeys) {
            sendLog(player, `You can't reserve any more keys.`, "error")
            return;
        }
    }

    if (keyNew) socket.emit("keyReserved", keyName);

    sendLog(player, `You pressed ${keyName}.`, "bold"); // send to player
    broadcastLog(player, `${player.name} pressed ${keyName}.`); // send to other clients

    keypress(keyData); // emulate keypress

    logger.info(`Valid keypress from ${player.name} (#${player.id}): ${keyName}.`);
}

module.exports = { testKeypress, handleKeyPress, keyExists, enableKey, disableKey, enableAllKeys, disableAllKeys };