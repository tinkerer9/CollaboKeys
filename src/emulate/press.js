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

/* Interfaces with helper.c to emulate keypresses much faster */

const { spawn } = require("child_process");
const path = require("path");
const { logger } = require("../log");

const helper = spawn(
    path.join(__dirname, "helper"), // compiled helper script (NOT helper.c)
    [],
    {
        stdio: ["pipe", "ignore", "pipe"]
    }
);

helper.stderr.on("data", (data) => {
    logger.error("[keyhelper]", data.toString());
});

helper.on("error", (err) => {
    logger.error("Failed to start keyhelper:", err);
});

helper.on("exit", (code) => {
    logger.error("Keyhelper exited with code", code);
});

function emulateKeypress(keycode, needsShift = false) {
    helper.stdin.write(
        `${keycode} ${needsShift ? 1 : 0}\n` // acts like typing a command into the terminal and hitting enter (\n)
    );
}

module.exports = { emulateKeypress };