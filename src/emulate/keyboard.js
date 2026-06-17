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

/* Interfaces with helper.c to emulate keypresses much faster */

/*!
 *  FUTURE-PROOFING
 *  Future plans for CollaboKeys involve the ability of held keys.
 *  This enables the ability to play the many games that require held keys.
 *  The keyboard class supports keyDown() and keyUp().
 *  This is also how type.js holds down shift while typing a capital letter.
 */

const { spawn } = require("child_process");
const path = require("path");
const { logger } = require("../log");

const EVENT_KEY_DOWN = 1;
const EVENT_KEY_UP = 2;
const EVENT_KEY_PRESS = 3;

class KeyboardHelper {
    constructor() {
        this.helper = spawn(
            path.join(__dirname, "helper"),
            [],
            {
                stdio: ["pipe", "ignore", "pipe"]
            }
        );
        this.ready = true;
        this.helper.on("error", (err) => {
            this.ready = false;
            console.error("Failed to start keyboard helper:", err);
        });
        this.helper.on("exit", (code, signal) => {
            this.ready = false;
            console.error(
                `Keyboard helper exited (code=${code}, signal=${signal})`
            );
        });
        this.helper.stderr.on("data", (data) => {
            const msg = data.toString().trim();
            switch (msg) {
                case "PERMISSION_DENIED":
                    console.error("[keyboard helper] Accessibility permission required.");
                    break;
                case "EVENT_CREATE_FAILED":
                    console.error("[keyboard helper] Failed to create keyboard event."
                    );
                    break;
                default:
                    console.error("k[eyboard helper]", msg);
                    break;
            }
        });
    }

    sendEvent(keycode, eventType = EVENT_KEY_PRESS) {
        if (!this.ready) return false;

        const packet = Buffer.alloc(3);

        packet.writeUInt16LE(keycode, 0);
        packet.writeUInt8(eventType, 2);

        return this.helper.stdin.write(packet);
    }

    press(keycode) {
        return this.sendEvent(keycode, EVENT_KEY_PRESS);
    }

    keyDown(keycode) {
        return this.sendEvent(keycode, EVENT_KEY_DOWN);
    }

    keyUp(keycode) {
        return this.sendEvent(keycode, EVENT_KEY_UP);
    }

    stop() {
        if (!this.helper) return;
        this.ready = false;
        this.helper.stdin.end();
        this.helper.kill();
    }
}

module.exports = { KeyboardHelper };