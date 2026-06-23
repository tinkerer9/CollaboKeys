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

/* Manages players globally. */

const { logger } = require("./log");
const Variables = require("./variables");

const players = {};

function getPlayerCount() {
    return Object.keys(players).length;
}

function addPlayer(pid, player) {
    players[pid] = player;
}

function removePlayer(pid) {
    delete players[pid];
}

function getPlayerByPid(pid) {
    return players[pid];
}

function isPlayer(pid) {
    return pid in players;
}

function getAllPlayers() {
    return Object.values(players);
}

module.exports = { getPlayerCount, addPlayer, removePlayer, getPlayerByPid, isPlayer, getAllPlayers }