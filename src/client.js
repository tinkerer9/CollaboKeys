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
const { freeAssignment } = require("./key");
const Manager = require("./manager");

let maxPlayerId = 0; // increments every new player
let maxAdminId = 0; // increments every new admin

class Player {
    constructor(socket) {
        this.socket = socket;
        this.name = null; // null as preset for unnamed
        this.id = maxPlayerId++;

        Manager.addPlayer(this.id, this); // adds a reference to the player class to a object in manager.js

        /* flags */
        this.waitingRoom = Config.player.waitRoomWhenJoined;
    }
    setName(name) {
        /* name must be between 3 and 20 chars long (default) */
        if (name.length < Config.player.name.minLength) return 1;
        if (name.length > Config.player.name.maxLength) return 2;

        /* test to regex of [a-zA-Z0-9] (default) */
        const regex = new RegExp(Config.player.name.regex);
        if (!regex.test(name)) return 3;

        this.name = name;
        return 0;
    }
    destroy() {
        Manager.removePlayer(this.id);
        freeAssignment(this.id); // unlocks the keys that the player had assigned to them
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