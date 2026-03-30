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


enter.onclick = function() {
    socket.emit("setName", input.value);
}

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enter.click(); // simulate click on enter button
    }
});

socket.on("actions", function(e) {
    if (e === "hideusernamebox") { // when name entered successfully
        naming.style.display = 'none';
        allowKeyPresses = true;
        for (let contentHeader of contentHeaders) {
            contentHeader.style.display = 'block';
        }
    }
});

socket.on("log", function(e) {
    prependToLogList(e);
});

socket.on("id", function(e) {
    prependToLogList(`<li><b>Player ID: ${e}</b></li>`);
    console.log(`Player ID: ${e}`);
});

socket.on("keyReserved", function(e) {
    appendToKeyList(e);
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