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
const shiftKeycode = keycodes["Shift"][0]; // get key info

function stopKeyboard() {
    keyboard.stop();
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
    let [keycode,, needsShift] = keycodes[key]; // get key info

    if (needsShift) keyboard.keyDown(shiftKeycode);
    keyboard.press(keycode);
    if (needsShift) keyboard.keyUp(shiftKeycode);
}

function testKeypress(key) { // for console command
    if (!keyExists(key)) return `'${key}' is not supported.`

    let keyName = getKeyName(key);

    keypress(key); // emulate keypress

    return key === keyName ? `'${key}' pressed.` : `'${key}' (${keyName}) pressed.`;
}

function handleKeyPress(socket, player, data) {
    if (!Variables.allowEmulation) {
        sendLog(player, "Emulation is disabled by admin.", "bad"); // send to player
        return;
    }

    if (!player.canType()) return; // only allows players that are named and not waitroomed to press keys

    let keyData = data.key;

    if (!keyExists(keyData)) {
        sendLog(player, `${keyData} is not supported.`, "bad"); // send to player
        return;
    }

    let keyName = getKeyName(keyData);

    if (!keyEnabled(keyData)) {
        sendLog(player, `${keyName} is disabled by admin.`, "bad"); // send to player
        return;
    }

    let [keyAllowed, keyNew] = Key.keyAllowed(keyData, player.id); 

    if (!keyAllowed) {
        if (keyNew) { // reservation disabled
            sendLog(player, `Auto-reservation is disabled by admin.`, "bad"); // send to player
        } else { // key already reserved
            sendLog(player, `${keyName} is already reserved.`, "bad"); // send to player
        }
        return;
    }

    if (Config.player.maxReservedKeys > 0) { // 0 = no limit
        if (Key.keyCount(player.id) > Config.player.maxReservedKeys) {
            sendLog(player, `You can't reserve any more keys.`, "bad")
            return;
        }
    }

    if (keyNew) socket.emit("keyReserved", keyName);

    sendLog(player, `You pressed ${keyName}.`, "bold"); // send to player
    broadcastLog(player, `${player.name} pressed ${keyName}.`); // send to other clients

    keypress(keyData); // emulate keypress

    logger.info(`Valid keypress from ${player.name} (#${player.id}): ${keyName}.`);
}

module.exports = { stopKeyboard, testKeypress, handleKeyPress, keyExists, enableKey, disableKey, enableAllKeys, disableAllKeys };