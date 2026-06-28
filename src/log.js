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
const Variables = require("./variables");
const Utils = require("./utils");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(), // Adds timestamp to info object
        winston.format.json() // Encodes the result as JSON
    ),
    exitOnError: false, // don't stop the program when error logs are made
    handleExceptions: true,
    transports: [], // added later
});

const logFolderPath = Variables.electronPackaged ? path.join(Variables.userDataPath, "logs") : path.join(__dirname, "..", "logs");

console.log(`Log files at ${logFolderPath}`);

if (Config.logs.deleteAtStart) {
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
            filename: path.join(logFolderPath, type + ".log"),
            level: level
        }));
    });
}

// log to console if not in production:
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.printf(({ level, message }) => `${level.toUpperCase()}: ${message}`),
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
            switch (info.level) {
                case "error": // all bolded and red
                    this.adminNamespace.in("admin").emit("log", `*ERROR: ${info.message}*`, "bad");
                    break;
                case "warn": // all bolded and red
                    this.adminNamespace.in("admin").emit("log", `*WARNING: ${info.message}*`, "bad");
                    break;
                default: // only level bolded
                    this.adminNamespace.in("admin").emit("log", `*${info.level.toUpperCase()}:* ${info.message}`);
            }
        }

        // emit "logged" and execute the callback so Winston knows it's finished
        setImmediate(() => {
            this.emit("logged", info);
        });

        callback();
    }
}

function addAdminPageTransport(adminNamespace) { // called in utils.js when the admin page transport is found
    if (!Config.adminPage.enabled) return;

    logger.add(new AdminPageTransport({ level: "http", adminNamespace }));
}

function handleHttpLog(requestPath, req, res) {
    if (!Config.logs.logPage.enabled) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Log page is disabled");
        return;
    }

    let logName = requestPath === "/logs" || requestPath === "/logs/" ? "combined" : requestPath.substring(6); // remove /logs/ (adjust the 6 for this length)
    if (logName.startsWith("/")) logName = logName.substring(1);

    const logFilePath = path.join(logFolderPath, logName + ".log");

    if (fs.existsSync(logFilePath)) {
        fs.readFile(logFilePath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Error reading log file");
            } else {
                const lines = data.trim().split("\n");
                let formattedLogs = "";
                if (lines.length <= 1 && lines[0] === "") formattedLogs = "Logs empty";
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            const logEntry = JSON.parse(line);
                            const messageLines = logEntry.message.split("\n");

                            const prefix = `${logEntry.level.toUpperCase()}: `;
                            const indent = " ".repeat(prefix.length);

                            formattedLogs += prefix + messageLines[0] + "\n";

                            // indent lines other than the first to match the prefix
                            for (let i = 1; i < messageLines.length; i++) {
                                formattedLogs += indent + messageLines[i] + "\n";
                            }
                        } catch (e) { // not JSON, so add as text
                            formattedLogs += line + "\n";
                        }
                    }
                });

                // remove any empty or whitespace-only lines from the output
                formattedLogs = formattedLogs.split("\n").filter(line => line.trim() !== "").join("\n");
                if (!formattedLogs) formattedLogs = "Logs empty";

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

module.exports = { logger, addAdminPageTransport, handleHttpLog, logFolderPath };