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

/* Manages logging using Winston */

/*!
 *  How to log:
 *  
 *  1) Require the logger class from this file (log.js) at the top of each file: 
 *     const { logger } = require("./log");
 *  
 *  2) Use one of the following methods to log: (do not pass multiple arguments to concatenate)
 *     logger.error(`Error emulating keypress: ${err}`);
 *     logger.warn(`Display sleep preventer failed to start: ${err}`);
 *     logger.info(`Valid keypress from ${player.name} (#${player.id}): ${keyName}.`);
 *     logger.http(`Admin #${id} connected.`);
 *     logger.verbose(`Console command "${input}" ran with response:\n${logText}`);
 *     logger.debug( ... );
 *     logger.silly( ... );
 */

const winston = require("winston");
const Transport = require("winston-transport");
const fs = require("fs");
const path = require("path");

const Config = require("./config.json");

// not from utils.js because that causes a circular depencency issue:
function escapeHTML(str) { // replace chars that mess up HTML syntax
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>"); // replace newlines
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    exitOnError: false, // don't stop the program when error logs are made
    handleExceptions: true,
    transports: [], // added later
});

if (Config.logs.deleteAtStart) {
    const logFolderPath = path.join(__dirname, "..", "logs");

    fs.rm(logFolderPath, { recursive: true, force: true }, () => {
        addFileTransports(); // once done
    });
} else {
    addFileTransports(); // immediately
}

function addFileTransports() {
    Config.logs.logFileTypes.forEach((type) => {
        // skip unsupported types:
        if (!["error", "warn", "info", "http", "verbose", "debug", "silly", "combined"].includes(type)) return;

        const level = type === "combined" ? undefined : type;

        logger.add(new winston.transports.File({
            filename: `logs/${type}.log`,
            level: level
        }));
    });
}

// log to console if not in production:
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

/* custom log transport for admin page */
class AdminPageTransport extends Transport {
    constructor(opts) {
        super(opts);

        this.adminNamespace = opts.adminNamespace;
    }

    log(info, callback) {
        if (this.adminNamespace) {
            this.adminNamespace.in("admin").emit("log", `<li><b>${escapeHTML(info.level)}:</b> ${escapeHTML(info.message)}</li>`);
        }

        // emit 'logged' and execute the callback so Winston knows it's finished
        setImmediate(() => {
            this.emit('logged', info);
        });

        callback();
    }
}

function addAdminPageTransport(adminNamespace) { // called in utils.js when the admin page transport is found
    if (!Config.adminPage.enabled) return;
    
    logger.add(new AdminPageTransport({ level: 'http', adminNamespace }));
}

function handleHttpLog(requestPath, req, res) {
    if (!Config.logs.logPage.enabled) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Log page is disabled");
        return;
    }

    let logName = requestPath === "/logs" || requestPath === "/logs/" ? "combined" : requestPath.substring(6); // remove /logs/ (adjust the 6 for this length)
    if (logName.startsWith("/")) logName = logName.substring(1);

    const logFilePath = path.join(__dirname, "..", "logs", logName + ".log");

    if (fs.existsSync(logFilePath)) {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Error reading log file");
            } else {
                const lines = data.trim().split('\n');
                let formattedLogs = '';
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            const logEntry = JSON.parse(line);
                            const timestamp = logEntry.timestamp ? `[${new Date(logEntry.timestamp).toLocaleString()}] ` : '';
                            formattedLogs += `${timestamp}${logEntry.level.toUpperCase()}: ${logEntry.message}\n`;
                        } catch (e) {
                            formattedLogs += line + '\n'; // if not JSON, just show as is
                        }
                    }
                });
                res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
                res.end(formattedLogs);
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Log file not found");
    }
    return;
}

function getLogDirectory(type) {
    return path.join(__dirname, "..", "logs", type + ".log");
}

module.exports = { logger, addAdminPageTransport, handleHttpLog, getLogDirectory };