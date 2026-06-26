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
    // Looser checks for keyups (down = false)

    if (!player.canType()) return false;

    // Early exit for keyup events when emulation is disabled
    if (!down) return true;

    // Player-level checks
    if (!Variables.allowEmulation) {
        sendLog(player, "Emulation is disabled by admin.", "bad");
        return false;
    }

    // Global keypress rate limit
    if (Config.maxKeypressesPerMinute !== 0 && keypressesThisMinute >= Config.maxKeypressesPerMinute) {
        const secondsLeft = 60 - new Date().getSeconds();
        sendLog(player, `The global keypress limit has been reached. Please wait ${secondsLeft} seconds.`, "bad");
        return false;
    }

    // Key existence check
    if (!keyExists(key)) {
        sendLog(player, `${key} is not supported.`, "bad");
        return false;
    }

    const keyName = getKeyName(key);

    // Key enabled check
    if (!keyEnabled(key)) {
        sendLog(player, `${keyName} is disabled by admin.`, "bad");
        return false;
    }

    // Key availability check
    const [keyAllowed, isNew] = Key.keyAllowed(key, player.id);
    if (!keyAllowed) {
        const reason = isNew
            ? "Auto-reservation is disabled by admin."
            : `${keyName} is already reserved.`;
        sendLog(player, reason, "bad");
        return false;
    }

    // Player key reservation limit
    if (Config.player.maxReservedKeys > 0 && Key.keyCount(player.id) > Config.player.maxReservedKeys) {
        sendLog(player, "You can't reserve any more keys.", "bad");
        return false;
    }

    return true;
}

function handleKeydown(player, key) {
    if (!canType(player, key, true)) return;

    const keyName = getKeyName(key);
    const keyCode = keycodes[key][0];
    const keyNew = Key.keyAllowed(key, player.id)[1];

    keypressesThisMinute++;

    // Notify player of new key reservation
    if (keyNew) player.socket.emit("keyReserved", keyName);

    // Log the keypress
    sendLog(player, `You pressed ${keyName}.`, "bold");
    broadcastLog(player, `${player.name} pressed ${keyName}.`);
    logger.info(`${player.name} (#${player.id}) pressed ${keyName}.`)

    // Emulate the keypress
    if (Config.allowHeldKeys) {
        keyboard.down(keyCode);
    } else {
        keyboard.press(keyCode);
    }
}

function handleKeyup(player, key) {
    if (!canType(player, key, false) || !Config.allowHeldKeys) return;

    keyboard.up(keycodes[key][0]);
}

// reset keypressesThisMinute every clock minute
const msUntilNextMinute = 60000 - (Date.now() % 60000);
setTimeout(() => {
    keypressesThisMinute = 0;
    setInterval(() => keypressesThisMinute = 0, 60000);
}, msUntilNextMinute);

module.exports = { stopKeyboard, testKeypress, handleKeydown, handleKeyup, keyExists, enableKey, disableKey, enableAllKeys, disableAllKeys };