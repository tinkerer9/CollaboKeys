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

/* Just a list of keycodes for type.js */

const keycodes = {
    // "keyName": [keyCode, "humanName", enabled, assignedPlayer],

    "a": [0, "a", true, null],
    "b": [11, "b", true, null],
    "c": [8, "c", true, null],
    "d": [2, "d", true, null],
    "e": [14, "e", true, null],
    "f": [3, "f", true, null],
    "g": [5, "g", true, null],
    "h": [4, "h", true, null],
    "i": [34, "i", true, null],
    "j": [38, "j", true, null],
    "k": [40, "k", true, null],
    "l": [37, "l", true, null],
    "m": [46, "m", true, null],
    "n": [45, "n", true, null],
    "o": [31, "o", true, null],
    "p": [35, "p", true, null],
    "q": [12, "q", true, null],
    "r": [15, "r", true, null],
    "s": [1, "s", true, null],
    "t": [17, "t", true, null],
    "u": [32, "u", true, null],
    "v": [9, "v", true, null],
    "w": [13, "w", true, null],
    "x": [7, "x", true, null],
    "y": [16, "y", true, null],
    "z": [6, "z", true, null],

    "0": [29, "0", true, null],
    "1": [18, "1", true, null],
    "2": [19, "2", true, null],
    "3": [20, "3", true, null],
    "4": [21, "4", true, null],
    "5": [23, "5", true, null],
    "6": [22, "6", true, null],
    "7": [26, "7", true, null],
    "8": [28, "8", true, null],
    "9": [25, "9", true, null],

    "-": [27, "-", true, null],
    "=": [24, "=", true, null],
    "[": [33, "[", true, null],
    "]": [30, "]", true, null],
    "\\": [42, "\\", true, null],
    ";": [41, ";", true, null],
    "'": [39, "'", true, null],
    ",": [43, ",", true, null],
    ".": [47, ".", true, null],
    "/": [44, "/", true, null],
    "`": [50, "`", true, null],

    " ": [49, "space", true, null],
    "Enter": [36, "return", true, null],

    "ArrowLeft": [123, "left arrow", true, null],
    "ArrowRight": [124, "right arrow", true, null],
    "ArrowDown": [125, "down arrow", true, null],
    "ArrowUp": [126, "up arrow", true, null],

    /* Keys disabled by default: */
    "Shift": [56, "shift", false, null],
    "CapsLock": [57, "caps lock", false, null],
    "Backspace": [51, "delete", false, null],
    "Tab": [48, "tab", false, null],
    "Meta": [55, "command", false, null],
    "Alt": [58, "option", false, null],
    "Control": [59, "control", false, null],
    "Escape": [53, "esc", false, null],

    /* Keys disabled by default: */
    "F1": [122, "F1", false, null],
    "F2": [120, "F2", false, null],
    "F3": [99, "F3", false, null],
    "F4": [118, "F4", false, null],
    "F5": [96, "F5", false, null],
    "F6": [97, "F6", false, null],
    "F7": [98, "F7", false, null],
    "F8": [100, "F8", false, null],
    "F9": [101, "F9", false, null],
    "F10": [109, "F10", false, null],
    "F11": [103, "F11", false, null],
    "F12": [111, "F12", false, null],
    "F13": [105, "F13", false, null], // not on regular keyboard layout
    "F14": [107, "F14", false, null], // not on regular keyboard layout
    "F15": [113, "F15", false, null], // not on regular keyboard layout
    "F16": [106, "F16", false, null], // not on regular keyboard layout
    "F17": [64, "F17", false, null], // not on regular keyboard layout
    "F18": [79, "F18", false, null], // not on regular keyboard layout
    "F19": [80, "F19", false, null], // not on regular keyboard layout
    "F20": [90, "F20", false, null] // not on regular keyboard layout
}

const { getPlayerByPid } = require("./manager");
const { logger } = require("./log");
const Variables = require("./variables");

function makeKeycodesTable() {
    try {
        const headers = [
            "Key",
            "Enabled",
            "Player ID"
        ];

        const rows = Object.entries(keycodes).map(formatRow);

        const widths = headers.map((header, colIndex) => {
            return Math.max(
                header.length,
                ...rows.map(row => row[colIndex].length)
            );
        });

        const topBorder    = "┌" + widths.map(w => "─".repeat(w + 2)).join("┬") + "┐";
        const middleBorder = "├" + widths.map(w => "─".repeat(w + 2)).join("┼") + "┤";
        const bottomBorder = "└" + widths.map(w => "─".repeat(w + 2)).join("┴") + "┘";

        const headerRow =
            "│ " +
            headers.map((h, i) => center(h, widths[i])).join(" │ ") +
            " │";

        const bodyRows = rows.map(row =>
            "│ " +
            row.map((cell, i) => center(cell, widths[i])).join(" │ ") +
            " │"
        );

        return [
            topBorder,
            headerRow,
            middleBorder,
            ...bodyRows,
            bottomBorder
        ].join("\n");
    } catch (err) {
        logger.error(`Unable to create keycodes table: ${err}`);
        return "Unable to create keycodes table.";
    }
}

function formatRow([keyName, [keyCode, humanName, enabled, assignedPlayer]]) {
    return [
        `'${keyName}'` + (keyName === humanName ? "" : ` (${humanName})`),
        enabled ? "yes" : "no",
        assignedPlayer === null ? "-" : `${getPlayerByPid(assignedPlayer).name} (#${assignedPlayer})`
    ];
}

function center(str, width) {
    const totalPadding = width - str.length;
    const left = Math.floor(totalPadding / 2);
    const right = totalPadding - left;
    return " ".repeat(left) + str + " ".repeat(right);
}

module.exports = { keycodes, makeKeycodesTable };