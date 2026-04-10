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
    // "keyName": [keyCode, "humanName", needsShift, enabled, assignedPlayer],

    "a": [0, "a", false, true, null],
    "b": [11, "b", false, true, null],
    "c": [8, "c", false, true, null],
    "d": [2, "d", false, true, null],
    "e": [14, "e", false, true, null],
    "f": [3, "f", false, true, null],
    "g": [5, "g", false, true, null],
    "h": [4, "h", false, true, null],
    "i": [34, "i", false, true, null],
    "j": [38, "j", false, true, null],
    "k": [40, "k", false, true, null],
    "l": [37, "l", false, true, null],
    "m": [46, "m", false, true, null],
    "n": [45, "n", false, true, null],
    "o": [31, "o", false, true, null],
    "p": [35, "p", false, true, null],
    "q": [12, "q", false, true, null],
    "r": [15, "r", false, true, null],
    "s": [1, "s", false, true, null],
    "t": [17, "t", false, true, null],
    "u": [32, "u", false, true, null],
    "v": [9, "v", false, true, null],
    "w": [13, "w", false, true, null],
    "x": [7, "x", false, true, null],
    "y": [16, "y", false, true, null],
    "z": [6, "z", false, true, null],

    "A": [0, "A", true, true, null],
    "B": [11, "B", true, true, null],
    "C": [8, "C", true, true, null],
    "D": [2, "D", true, true, null],
    "E": [14, "E", true, true, null],
    "F": [3, "F", true, true, null],
    "G": [5, "G", true, true, null],
    "H": [4, "H", true, true, null],
    "I": [34, "I", true, true, null],
    "J": [38, "J", true, true, null],
    "K": [40, "K", true, true, null],
    "L": [37, "L", true, true, null],
    "M": [46, "M", true, true, null],
    "N": [45, "N", true, true, null],
    "O": [31, "O", true, true, null],
    "P": [35, "P", true, true, null],
    "Q": [12, "Q", true, true, null],
    "R": [15, "R", true, true, null],
    "S": [1, "S", true, true, null],
    "T": [17, "T", true, true, null],
    "U": [32, "U", true, true, null],
    "V": [9, "V", true, true, null],
    "W": [13, "W", true, true, null],
    "X": [7, "X", true, true, null],
    "Y": [16, "Y", true, true, null],
    "Z": [6, "Z", true, true, null],

    "0": [29, "0", false, true, null],
    "1": [18, "1", false, true, null],
    "2": [19, "2", false, true, null],
    "3": [20, "3", false, true, null],
    "4": [21, "4", false, true, null],
    "5": [23, "5", false, true, null],
    "6": [22, "6", false, true, null],
    "7": [26, "7", false, true, null],
    "8": [28, "8", false, true, null],
    "9": [25, "9", false, true, null],

    "!": [18, "!", true, true, null],
    "@": [19, "@", true, true, null],
    "#": [20, "#", true, true, null],
    "$": [21, "$", true, true, null],
    "%": [23, "%", true, true, null],
    "^": [22, "^", true, true, null],
    "&": [26, "&", true, true, null],
    "*": [28, "*", true, true, null],
    "(": [25, "(", true, true, null],
    ")": [29, ")", true, true, null],

    "-": [27, "-", false, true, null],
    "_": [27, "_", true, true, null],
    "=": [24, "=", false, true, null],
    "+": [24, "+", true, true, null],

    "[": [33, "[", false, true, null],
    "{": [33, "{", true, true, null],
    "]": [30, "]", false, true, null],
    "}": [30, "}", true, true, null],

    "\\": [42, "\\", false, true, null],
    "|": [42, "|", true, true, null],

    ";": [41, ";", false, true, null],
    ":": [41, ":", true, true, null],

    "'": [39, "'", false, true, null],
    "\"": [39, "\"", true, true, null],

    ",": [43, ",", false, true, null],
    "<": [43, "<", true, true, null],

    ".": [47, ".", false, true, null],
    ">": [47, ">", true, true, null],

    "/": [44, "/", false, true, null],
    "?": [44, "?", true, true, null],

    "`": [50, "`", false, true, null],
    "~": [50, "~", true, true, null],

    " ": [49, "space", false, true, null],
    "Enter": [36, "return", false, true, null],

    "ArrowLeft": [123, "left arrow", false, true, null],
    "ArrowRight": [124, "right arrow", false, true, null],
    "ArrowDown": [125, "down arrow", false, true, null],
    "ArrowUp": [126, "up arrow", false, true, null],

    /* Keys disabled by default: */
    "Shift": [56, "shift", false, false, null], // won't work
    "CapsLock": [57, "caps lock", false, false, null], // won't work
    "Backspace": [51, "delete", false, false, null],
    "Tab": [48, "tab", false, false, null],
    "Meta": [55, "command", false, false, null],
    "Alt": [58, "option", false, false, null],
    "Control": [59, "control", false, false, null],
    "Escape": [53, "esc", false, false, null],
    
    /* Keys disabled by default: */
    "F1": [122, "F1", false, false, null],
    "F2": [120, "F2", false, false, null],
    "F3": [99, "F3", false, false, null],
    "F4": [118, "F4", false, false, null],
    "F5": [96, "F5", false, false, null],
    "F6": [97, "F6", false, false, null],
    "F7": [98, "F7", false, false, null],
    "F8": [100, "F8", false, false, null],
    "F9": [101, "F9", false, false, null],
    "F10": [109, "F10", false, false, null],
    "F11": [103, "F11", false, false, null],
    "F12": [111, "F12", false, false, null],
    "F13": [105, "F13", false, false, null], // not on regular keyboard layout
    "F14": [107, "F14", false, false, null], // not on regular keyboard layout
    "F15": [113, "F15", false, false, null], // not on regular keyboard layout
    "F16": [106, "F16", false, false, null], // not on regular keyboard layout
    "F17": [64, "F17", false, false, null], // not on regular keyboard layout
    "F18": [79, "F18", false, false, null], // not on regular keyboard layout
    "F19": [80, "F19", false, false, null], // not on regular keyboard layout
    "F20": [90, "F20", false, false, null] // not on regular keyboard layout
}


const { getPlayerByPid } = require("./manager");

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
        console.warn("Unable to create keycodes table: ", err);
        return "Unable to create keycodes table.";
    }
}

function formatRow([keyName, [keyCode, humanName, needsShift, enabled, assignedPlayer]]) {
    return [
        `'${keyName}'` + (keyName === humanName ? "" : ` (${humanName})`),
        enabled ? "yes" : "no",
        assignedPlayer === null ? "-" : `${getPlayerByPid(assignedPlayer)} (#${assignedPlayer})`
    ];
}

function center(str, width) {
    const totalPadding = width - str.length;
    const left = Math.floor(totalPadding / 2);
    const right = totalPadding - left;
    return " ".repeat(left) + str + " ".repeat(right);
}

module.exports = { keycodes, makeKeycodesTable };