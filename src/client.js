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

/* This script manages metadata about each player. */

const Config = require("./config.json");
const Utils = require("./utils");

const FALLBACK_NAME = "No Name"; // Used if the player has not set a name yet

let maxPlayerId = 0; // increments every time
let maxAdminId = 0; // increments every time

function hasNoAlphabeticalChars(str) {
    return !/[a-zA-Z0-9]/.test(str);
}

class Player {
    constructor(socket) {
        this.socket = socket;
        this.name = null; // null as preset for unnamed
        this.id = maxPlayerId++;

        /* flags */
        this.waitingRoom = Config.waitRoomPlayersWhenJoined;
    }
    getName() {
        return this.name || FALLBACK_NAME; // returns FALLBACK_NAME if no name is set
    }
    setName(name) {
        /* name must be between 3 and 20 chars long */
        if (name.length < 3) return 1;
        if (name.length > 20) return 2;
        if (hasNoAlphabeticalChars(name)) return 3;
        this.name = name;
        return 0;
    }
    destroy() {
        // doesn't do anything yet
    }
    noNameSet() {
        return this.name === null; // if no name set
    }
    message(content) {
        Utils.sendLog(this, content, "bold");
    }
    admit() {
        this.waitingRoom = false;
    }
    dismiss() {
        this.waitingRoom = true;
    }
    canType() { // if player allowed to type
        return !this.noNameSet() && !this.waitingRoom;
    }
}

class Admin {
    constructor(socket) {
        this.socket = socket;
        this.id = maxAdminId++;

        /* flags */
        this.authenticated = false;
    }
    destroy() {
        // doesn't do anything yet
    }
    authenticate() {
        this.authenticated = true;
    }
    message(content) {
        Utils.sendLog(this, content, "bold");
    }
}

module.exports = { Player, Admin };