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

const socket = io("/admin");

const header = document.getElementsByClassName("header")[0];
const controls = document.getElementsByClassName("controls")[0];
const responses = document.getElementsByClassName("responses")[0];
const logs = document.getElementsByClassName("logs")[0];
const normalInfo = document.getElementById("normalInfo");
const noAdminInfo = document.getElementById("noAdminInfo");
const authentication = document.getElementsByClassName("authentication")[0];
const input = document.getElementById("input");
const enter = document.getElementById("enter");
const controlButtons = document.getElementsByClassName("controlButtons")[0];
const logList = document.getElementById("logList");
const responsesList = document.getElementById("responsesList");
const contentHeaders = document.getElementsByClassName("contentHeaders");

const customCommandText = document.getElementById("customCommandText");
const customCommand = document.getElementById("customCommand");
const stopCommand = document.getElementById("stopCommand");
const pauseCommand = document.getElementById("pauseCommand");
const resumeCommand = document.getElementById("resumeCommand");
const wrCommand = document.getElementById("wrCommand");
const wrCommandArg0 = document.getElementById("wrCommandArg0");
const wrCommandArg1 = document.getElementById("wrCommandArg1");
const wrCommandArg2 = document.getElementById("wrCommandArg2");
const lsCommand = document.getElementById("lsCommand");
const lsCommandArg0 = document.getElementById("lsCommandArg0");
const keyCommand = document.getElementById("keyCommand");
const keyCommandArg0 = document.getElementById("keyCommandArg0");
const keyCommandArg1 = document.getElementById("keyCommandArg1");
const keyCommandArg2 = document.getElementById("keyCommandArg2");

input.focus(); // immediately focus textbox

enter.onclick = function() {
    socket.emit("authenticate", input.value);
    input.focus();
    input.select();
};

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enter.click(); // simulate click on enter button
    }
});

/* COMMAND FUNCTIONS */

customCommand.onclick = function() {
    command(customCommandText.value);
    customCommandText.value = "";
};
customCommandText.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        customCommand.click(); // simulate click on enter button
    }
});
stopCommand.onclick = function() {
    command("stop");
};
pauseCommand.onclick = function() {
    command("pause");
};
resumeCommand.onclick = function() {
    command("resume");
};
wrCommand.onclick = function() {
    command("waitingroom", wrCommandArg0.value, wrCommandArg1.value === "all" ? "all" : wrCommandArg2.value);
    wrCommandArg2.value = "";
};
function wrCommandArg1Changed() {
    wrCommandArg2.style.display = wrCommandArg1.value === "all" ? "none" : "block";
}
lsCommand.onclick = function() {
    command("list", lsCommandArg0.value);
}
keyCommand.onclick = function() {
    command("key", keyCommandArg0.value, keyCommandArg1.value === "all" ? "all" : keyCommandArg2.value);
    keyCommandArg2.value = "";
};
function keyCommandArg1Changed() {
    keyCommandArg2.style.display = keyCommandArg1.value === "all" ? "none" : "block";
}

/* END COMMAND FUNCTIONS */

socket.on("actions", function(e) {
    if (e === "hidepasswordbox") { // when password entered successfully
        authentication.style.display = 'none';
        controlButtons.style.display = 'block';
        for (let contentHeader of contentHeaders) {
            contentHeader.style.display = 'block';
        }
    }
});

socket.on("log", function(e) {
    prependToLogList(e);
});

socket.on("noAdmin", function(e) {
    noAdminInfo.style.display = "block";
    normalInfo.style.display = "none";

    controls.style.filter = "brightness(0.5)";
    responses.style.filter = "brightness(0.5)";
    logs.style.filter = "brightness(0.5)";

    input.disabled = true;
    enter.disabled = true;
});

socket.on("response", function(e) {
    prependToResponseList(e);
});

socket.on("connect_error", (error) => {
    socket.disconnect();
    console.error("Connection error:", error.message);

    header.style.filter = "brightness(0.5)";
    controls.style.filter = "brightness(0.5)";
    responses.style.filter = "brightness(0.5)";

    prependToLogList("<li style='color: red;'><b>Failed to connect to the server.<br>Please restart the server program.</b></li>");
});

function command(command, ...args) {
    let commandString = args.length === 0 ? command : command + " " + args.join(" ");

    let rootCommand = commandString.split(" ")[0];

    if (["stop", "exit", "quit"].includes(rootCommand)) { // give response if stopping server
        prependToResponseList(`<li><b>${commandString}</b>:<br>Terminating the process...<li></li>`);
    }

    socket.emit("command", commandString);
}

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}

function prependToResponseList(message) {
    responsesList.insertAdjacentHTML('afterbegin', message);
}