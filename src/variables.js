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

/* Declare globally used variables (and their values) */

const Config = require("./config.json");

const variables = {
    mainNamespace: null,
    adminNamespace: null,
    serverPort: null,
    electronPackaged: null,
    userDataPath: null,
    allowEmulation: Config.allowEmulationAtStart,
    allowReservation: Config.allowReservationAtStart
}

module.exports = variables;