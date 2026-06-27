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
        const rawUrl = req.url || "";
        const requestUrl = rawUrl.split("?")[0];

        let requestPath;
        try {
            requestPath = decodeURIComponent(requestUrl);
        } catch (err) {
            res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Invalid URL");
            return;
        }

        if (requestPath.includes("\0")) {
            res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Invalid path");
            return;
        }

        requestPath = path.posix.normalize(requestPath);
        if (!requestPath.startsWith("/")) requestPath = "/" + requestPath;
        if (requestPath === "/") requestPath = "/index.html";

        // For /keycodes page (doesn't use Socket.IO and isn't static)
        if (requestPath === "/keycodes" || requestPath === "/keycodes/") {
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            res.end(makeKeycodesTable());
            return;
        }

        // For /logs page (Winston logs)
        if (requestPath.startsWith("/logs")) {
            handleHttpLog(requestPath, req, res);
            return;
        }

        const filePath = path.resolve(publicDir, "." + requestPath);
        if (!filePath.startsWith(publicDir + path.sep) && filePath !== publicDir) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("File not found");
            return;
        }

        fs.stat(filePath, (err, stats) => {
            if (err) {
                if (err.code === "ENOENT" || err.code === "ENOTDIR") {
                    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                    res.end("File not found");
                    return;
                }
                res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                res.end("Server error");
                return;
            }

            if (stats.isDirectory()) {
                if (!pathname.endsWith("/")) {
                    const safeRedirectLocation = pathname + "/" + (search || "");
                    res.writeHead(301, { Location: safeRedirectLocation });
                    res.end();
                    return;
                }

                const indexPath = path.join(filePath, "index.html");
                fs.stat(indexPath, (indexErr, indexStats) => {
                    if (indexErr || !indexStats.isFile()) {
                        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                        res.end("File not found");
                        return;
                    }
                    serveStaticFile(indexPath, res);
                });
                return;
            }

            serveStaticFile(filePath, res);
        });
    });

    return server;
}

function serveStaticFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Server error");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentType,
            "X-Content-Type-Options": "nosniff"
        });
        res.end(data);
    });}

module.exports = { createServer };