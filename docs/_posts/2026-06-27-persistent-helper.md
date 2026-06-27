---
layout: post
title: "How it Works: CollaboKeys' Persistent Helper"
date: 2026-06-27
tags: ["how it works", "persistent helper", "emulation"]
---

The core principle of CollaboKeys is being able to emulate keypresses on the host's computer.

CollaboKeys v2.0.0 spawned a new shell process to run a `osascript` command.
This also needed AppleScript to set up its interpreter to understand the command.
Finally, AppleScript would send the keypress to System Services.
This had to happen for each keypress, leading to a high latency for each keypress.

CollaboKeys v3.0.0 used a **persitent helper** which directly interfaced with System Services for lighting-fast emulation.

The persistent helper, `helper.c`, is programmed in C for low-level interfacing.
`keyboard.js` is a script that interfaces with `helper.c` to be used by Node.JS.

## `helper.c`

The persistent helper uses `ApplicationServices.h` to directly interface with System Services:

```c
#include <ApplicationServices/ApplicationServices.h>
```

Numerical codes are used for each type of key event:

```c
#define EVENT_KEY_DOWN  1
#define EVENT_KEY_UP    2
#define EVENT_KEY_PRESS 3
```

The `post_key` function is what actually emulates a keypress.
Its first argument is the [keycode](https://eastmanreference.com/complete-list-of-applescript-key-codes).
This is the same keycode that AppleScript uses, where `A` is `0` and `S` is `1`.
Its second argument is a boolean value representing the event type.
If it is `true`, then a keydown is emulated.
If it is `false`, then a keyup is emulated.

```c
static void post_key(uint16_t keycode, bool down) {
    CGEventRef event = CGEventCreateKeyboardEvent(NULL, keycode, down);
    if (!event) {
        fprintf(stderr, "EVENT_CREATE_FAILED\n");
        fflush(stderr);
        return;
    }
    CGEventPost(kCGHIDEventTap, event);
    CFRelease(event);
}
```

The `send_event` function parses the `event` buffer sent by the main loop and uses `post_key` to emulate it.
In the case of a keydown, which has code `1`, the keycode is emulated with `down = true`.
In the case of a keyup, which has code `2`, the keycode is emulated with `down = false`.
In the case of a keypress, which has code `3`, a keydown is emulated followed by a keyup.
A keypress is only used if held keys are disabled by the host.

```c
static void send_event(KeyEvent event) {
    switch (event.event_type) {
        case EVENT_KEY_DOWN:
            post_key(event.keycode, true);
            break;
        case EVENT_KEY_UP:
            post_key(event.keycode, false);
            break;
        case EVENT_KEY_PRESS:
            post_key(event.keycode, true);
            post_key(event.keycode, false);
            break;
        default:
            fprintf(
                stderr,
                "INVALID_EVENT_TYPE %u\n",
                event.event_type
            );
            fflush(stderr);
            break;
    }
}
```

The main loop constantly reads from `stdin`, waiting for `keyboard.js` to send a key event.
If one is sent, it emulates the key using `send_event`.

```c
int main(void) {
    KeyEvent event;
    uint8_t *buffer = (uint8_t *)&event;
    size_t bytesRead;

    while (true) {
        bytesRead = 0;

        while (bytesRead < sizeof(event)) {
            ssize_t result = read(STDIN_FILENO, buffer + bytesRead, sizeof(event) - bytesRead);
            if (result > 0) {
                bytesRead += (size_t)result;
                continue;
            }
            if (result == 0) goto exit;
            if (errno == EINTR) continue;
            if (errno == EAGAIN || errno == EWOULDBLOCK) continue; // retry when no data is available yet
            fprintf(stderr, "READ_FAILED %d\n", errno);
            fflush(stderr);
            return 2;
        }

        send_event(event);
    }

exit:
    return 0;
}
```

## `keyboard.js`

`keyboard.js` uses a child process to interface with `helper.c`:

```javascript
const { spawn } = require("child_process");
```

The same key event codes are used:

```javascript
const EVENT_KEY_DOWN = 1;
const EVENT_KEY_UP = 2;
const EVENT_KEY_PRESS = 3;
```

A `KeyboardHelper` class is used for centralized control.
When it is initialized, it finds the path of the compiled helper script and spawns it:

```javascript
class KeyboardHelper {
    constructor() {
        const helperPath = Variables.electronPackaged
            ? path.join(process.resourcesPath, "helper")
            : path.join(__dirname, "helper");

        this.helper = spawn(helperPath, [], { stdio: ["pipe", "ignore", "pipe"] });
    }
```

Another `sendEvent` function is used to interface with the persistent helper:

```javascript
    sendEvent(keycode, eventType = EVENT_KEY_PRESS) {
        const packet = Buffer.alloc(3);

        packet.writeUInt16LE(keycode, 0);
        packet.writeUInt8(eventType, 2);

        return this.helper.stdin.write(packet);
    }
```

There are `press`, `down`, and `up` functions that use `sendEvent` to emulate different events:

```javascript
    press(keycode) {
        return this.sendEvent(keycode, EVENT_KEY_PRESS);
    }

    down(keycode) {
        return this.sendEvent(keycode, EVENT_KEY_DOWN);
    }

    up(keycode) {
        return this.sendEvent(keycode, EVENT_KEY_UP);
    }
}
```

Finally, the class is exported for `type.js` to use it:

```javascript
module.exports = { KeyboardHelper };
```

## `type.js`

`type.js` is the main script that manages key emulation.
For example, it checks whether a key exists, is enabled, and if it is reserved by a player.

The `handleKeydown()` function is called whenever a player emits a `keydown` event.
It uses the `canType()` function to check if the key could and should be emulated.
Then it uses `keycodes.js` to find the keycode and name of the key.
Finally, it uses `keyboard.down()`, a function of `keyboard.js`, to emulate a keydown.
If held keys are not enabled by the host, a regular keypress is emulated instead.

```javascript
function handleKeydown(player, key) {
    if (!canType(player, key, true)) return;

    const keyName = getKeyName(key);
    const keyCode = keycodes[key][0];
    const keyNew = Key.keyAllowed(key, player.id)[1];

    keypressesThisMinute++;

    // Notify player of new key reservation
    if (keyNew) player.socket.emit("keyReserved", keyName);

    // Log the keypress
    sendLog(player, `You pressed ${keyName}.`, "bold");
    broadcastLog(player, `${player.name} pressed ${keyName}.`);
    logger.info(`${player.name} (#${player.id}) pressed ${keyName}.`)

    // Emulate the keypress
    if (Config.allowHeldKeys) {
        keyboard.down(keyCode);
    } else {
        keyboard.press(keyCode);
    }
}
```

The `handleKeyup()` function is significantly shorter.
Because a check too strict could end with a key permanently held down, the `canType()` function uses looser checks.
If held keys are not enabled by the host, keyups are not emulated because the key was already released with `keyboard.press`.

```javascript
function handleKeyup(player, key) {
    if (!canType(player, key, false) || !Config.allowHeldKeys) return;

    keyboard.up(keycodes[key][0]);
}
```

These three files form the base of lightning-fast emulation.
