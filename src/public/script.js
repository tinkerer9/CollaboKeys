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

const socket = io();

const header = document.getElementsByClassName("header")[0];
const logs = document.getElementsByClassName("logs")[0];
const keys = document.getElementsByClassName("keys")[0];
const naming = document.getElementsByClassName("naming")[0];
const input = document.getElementById("input");
const enter = document.getElementById("enter");
const logList = document.getElementById("logList");
const keysList = document.getElementById("keysList");
const contentHeaders = document.getElementsByClassName("contentHeaders");

let allowKeyPresses = false;

document.addEventListener("keydown", (e) => {
    if (e !== "Shift" && allowKeyPresses) {
        socket.emit("keyPress", { key: e.key });
    }
});

input.focus(); // immediately focus textbox

input.addEventListener('input', () => {
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
});


enter.onclick = () => {
    socket.emit("setName", input.value);
}

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        enter.click(); // simulate click on enter button
    }
});

socket.on("nameset", () => {
    naming.style.display = 'none';
    allowKeyPresses = true;
    for (let contentHeader of contentHeaders) {
        contentHeader.style.display = 'block';
    }
});

socket.on("log", (log, format) => {
    prependToLogList(formatLog(log, format));
});

socket.on("id", (id) => {
    console.log(`Player ID: ${id}`);
    document.title = `(${id}) CollaboKeys Player`;
});

socket.on("keyReserved", (key) => {
    appendToKeyList(key);
});

socket.on("connect_error", (error) => {
    socket.disconnect();
    console.error("Connection error:", error.message);

    header.style.filter = "brightness(0.5)";
    keys.style.filter = "brightness(0.5)";

    prependToLogList("<li style='color: red;'><b>Failed to connect to the server.<br>Please reload or contact the game host.</b></li>");
});

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}

function appendToKeyList(key) {
    const newItem = document.createElement("li");
    const itemText = document.createTextNode(key);
    
    newItem.appendChild(itemText);
    keysList.appendChild(newItem);
}

function escapeHTML(str) { // replace chars that mess up HTML syntax
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>"); // replace newlines
}

function formatLog(content, format) {
    // Use asterisks for *bold* (not double)
    content = escapeHTML(content);

    switch (format) {
        case "good": case "bad": case "bold": // bolded by default
            content = content.replace(/\*/g, ""); // remove asterisks
            content = `<b>${content}</b>`; // make bold

            switch (format) {
                case "good":
                    return `<li class="good">${content}</li>`;
                case "bad":
                    return `<li class="bad">${content}</li>`;
                case "bold":
                    return content; // already bolded
                }
            break;
        default: // normal format or invalid
            content = content.replace(/\*([^*]+)\*/g, "<b>$1</b>"); // bold phrases surrounded by asterisks
            content = content.replace(/\*/g, ""); // remove asterisks if any left (odd number given)
            return `<li>${content}</li>`;
    }
}