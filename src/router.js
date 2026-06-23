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

/* Create the HTTP server and route requests */

const http = require("http");
const fs = require("fs");
const path = require("path");

const { logger } = require("./log");
const { makeKeycodesTable } = require("./keycodes");
const { licenseInfo, warrantyInfo } = require("./license");
const { handleHttpLog } = require("./log");
const Variables = require("./variables");

/* If other filetypes/extensions used, add here: */
const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".gif": "image/gif",
    ".json": "application/json"
    // default: "text/plain"
};

function createServer() {
    const publicDir = path.join(__dirname, "public");

    const server = http.createServer((req, res) => {
        let requestPath = decodeURIComponent(req.url.split("?")[0]);

        // Default to root
        if (requestPath === "/") requestPath = "/index.html";

        // For /keycodes page (doesn't use Socket.IO and isn't static)
        if (requestPath === "/keycodes" || requestPath === "/keycodes/") {
            res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            res.end(makeKeycodesTable());
            return;
        }

        // For /license page (doesn't use Socket.IO)
        if (requestPath === "/license" || requestPath === "/license/") {
            res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            res.end(licenseInfo);
            return;
        }

        // For /warranty page (doesn't use Socket.IO)
        if (requestPath === "/warranty" || requestPath === "/warranty/") {
            res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            res.end(warrantyInfo);
            return;
        }

        // For /logs page (Winston logs)
        if (requestPath.startsWith("/logs")) {
            handleHttpLog(requestPath, req, res);
            return; // skip below
        }

        let filePath = path.join(publicDir, requestPath);

        // Check if path exists
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                // Ensure URL ends with slash
                if (!req.url.endsWith("/")) {
                    res.writeHead(301, { Location: req.url + "/" });
                    res.end();
                    return;
                }

                // Serve index.html in the folder
                filePath = path.join(filePath, "index.html");
            }
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("File not found");
            return;
        }

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        let contentType = mimeTypes[ext] || "text/plain";

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Server error");
                return;
            }
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        });
    });

    return server;
}

module.exports = { createServer };