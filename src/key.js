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

/* This script manages which keys are assigned to each player */

const { keycodes } = require("./keycodes");
const Config = require("./config.json");
const { logger } = require("./log");
const Variables = require("./variables");

function assignKey(key, id) {
    keycodes[key][4] = id;
}
function isAssignedKey(key, id) {
    return keycodes[key][4] === id;
}
function keyIsAssigned(key) {
    return keycodes[key][4] !== null;
}

function keyAllowed(key, id) { // returns if key is allowed to be pressed and if was unreserved
    if (keyIsAssigned(key)) {
        if (isAssignedKey(key, id)) {
            return [true, false];
        } else {
            return [false, false];
        }
    } else if (Config.autoAssignUnreservedKeys) {
        assignKey(key, id); // assign and allow
        return [true, true];
    } else {
        return [false, false];
    }
}

function keyCount(id) { // gets the number of key reservations a specified player has
    let count = 0;

    Object.keys(keycodes).forEach(key => {
        if (keycodes[key][4] === id) {
            count += 1;
        }
    });

    return count;
}

function freeAssignment(id) {
    Object.keys(keycodes).forEach(key => {
        if (keycodes[key][4] === id) {
            revokeKey(key);
        }
    });
}

function revokeKey(key) {
    assignKey(key, null);
}

function revokeAllKeys() {
    Object.keys(keycodes).forEach(key => {
        revokeKey(key);
    });
}

module.exports = { assignKey, keyAllowed, freeAssignment, revokeKey, revokeAllKeys, keyCount }; 