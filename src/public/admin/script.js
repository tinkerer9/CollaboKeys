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

const clearResponsesCommand = document.getElementById("clearResponsesCommand");
const clearLogsCommand = document.getElementById("clearLogsCommand");
const customCommandText = document.getElementById("customCommandText");
const customCommand = document.getElementById("customCommand");
const stopCommand = document.getElementById("stopCommand");
const pauseCommand = document.getElementById("pauseCommand");
const resumeCommand = document.getElementById("resumeCommand");
const uriCommand = document.getElementById("uriCommand");
const qrCommand = document.getElementById("qrCommand");
const showCommand = document.getElementById("showCommand");
const showCommandArg0 = document.getElementById("showCommandArg0");
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
const kcCommand = document.getElementById("kcCommand");
const logsCommand = document.getElementById("logsCommand");
const logsCommandArg0 = document.getElementById("logsCommandArg0");

let linkQR = null; // null = not (yet) sent to client

input.focus(); // immediately focus textbox

enter.onclick = () => {
    socket.emit("authenticate", input.value);
    input.focus();
    input.select();
};

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        enter.click(); // simulate click on enter button
    }
});

/* COMMAND FUNCTIONS */

clearResponsesCommand.onclick = () => {
    responsesList.innerHTML = "";
}
clearLogsCommand.onclick = () => {
    logList.innerHTML = "";
}
customCommand.onclick = () => {
    command(customCommandText.value);
    customCommandText.value = "";
};
customCommandText.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        customCommand.click(); // simulate click on enter button
    }
});
stopCommand.onclick = () => {
    command("stop");
};
pauseCommand.onclick = () => {
    command("pause");
};
resumeCommand.onclick = () => {
    command("resume");
};
uriCommand.onclick = () => {
    command("uri");
}
qrCommand.onclick = () => {
    command("qr");
}
showCommand.onclick = () => {
    command("show", showCommandArg0.value);
};
wrCommand.onclick = () => {
    command("waitingroom", wrCommandArg0.value, wrCommandArg1.value === "all" ? "all" : wrCommandArg2.value);
    wrCommandArg2.value = "";
};
wrCommandArg1.onchange = () => {
    wrCommandArg2.style.display = wrCommandArg1.value === "all" ? "none" : "block";
}
lsCommand.onclick = () => {
    command("list", lsCommandArg0.value);
}
keyCommand.onclick = () => {
    command("key", keyCommandArg0.value, keyCommandArg1.value === "all" ? "all" : keyCommandArg2.value);
    keyCommandArg2.value = "";
};
keyCommandArg1.onchange = () => {
    keyCommandArg2.style.display = keyCommandArg1.value === "all" ? "none" : "block";
}
kcCommand.onclick = () => {
    command("keycodes");
}
logsCommand.onclick = () => {
    command("logs", logsCommandArg0.value);
}

/* END COMMAND FUNCTIONS */

socket.on("authenticated", () => {
    authentication.style.display = 'none';
    controlButtons.style.display = 'block';
    for (let contentHeader of contentHeaders) {
        contentHeader.style.display = 'block';
    }
});

socket.on("log", (log) => {
    prependToLogList(log);
});

socket.on("noAdmin", () => {
    noAdminInfo.style.display = "block";
    normalInfo.style.display = "none";

    controls.style.filter = "brightness(0.5)";
    responses.style.filter = "brightness(0.5)";
    logs.style.filter = "brightness(0.5)";

    input.disabled = true;
    enter.disabled = true;
});

socket.on("response", (response) => {
    prependToResponseList(response);
});

socket.on("qr", qr => linkQR = qr); // set "linkQR" variable when recieved

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
        prependToResponseList(`<li><b>${commandString}</b>:<br>Terminating the process...</li>`);
    }

    if (["kc", "keycodes"].includes(rootCommand)) {
        window.open('/keycodes', '_blank');
        prependToResponseList(`<li><b>${commandString}</b>:<br>Opening keycodes list in a new tab...</li>`);
        return; // don't send command
    }
    
    if (["l", "logs"].includes(rootCommand)) {
        let type = commandString.split(" ")[1] || "combined";
        window.open(`/logs${type === "combined" ? "" : `/${type}`}`, '_blank');
        prependToResponseList(`<li><b>${commandString}</b>:<br>Opening logs in a new tab...</li>`);
        return; // don't send command
    }

    if (rootCommand === "qr") { // no aliases (yet)
        if (linkQR === null) {
            prependToResponseList(`<li><b>${commandString}</b>:<br>Unable to show QR code.</li>`);
        } else {
            openQR(linkQR);
            prependToResponseList(`<li><b>${commandString}</b>:<br>Opening QR code in a new window...</li>`);
        }
        return; // don't send command
    }

    socket.emit("command", commandString);
}

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}

function prependToResponseList(message) {
    responsesList.insertAdjacentHTML('afterbegin', message);
}

function openQR(url) {
    const w = window.open('', '', 'width=250,height=250,popup=yes');
  
    w.document.write(`
        <html>
        <head>
            <title>QR Code</title>
            <style>
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #fff; }
                body { display: flex; justify-content: center; align-items: center; }
                img { width: 100%; height: 100%; object-fit: contain; }
            </style>
        </head>
        <body>
            <img src="${url}">
        </body>
        </html>
    `);
    w.document.close();
}