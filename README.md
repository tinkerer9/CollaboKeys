# CollaboKeys

a collaborative keyboard game

Made by [@tinkerer9](https://github.com/tinkerer9), [@LethalShadowFlame](https://github.com/LethalShadowFlame), and [@chickenlloyd](https://github.com/chickenlloyd) for a hackathon with theme *Connection*.
We got 2nd place out of 14 teams!

Players collaborate to play any keyboard-based game with their assigned key, making browsing the internet a simple puzzle.
Think quick!

## Instructions

### Install dependencies

The host/server program is made to run on MacOS, but the client webpage should run on almost any computer.

- **Node.js**: download latest version from [nodejs.org/en/download](https://nodejs.org/en/download)
- **Socket.IO**: run `npm install socket.io` in the terminal
- **Electron**: run `npm install electron --save-dev` in the terminal
- **electron-builder**: run `npm install electron-builder --save-dev` in the terminal

### Run server

Set your working directory to project root.
Run one of the following commands, depending on your goal:

- **Run with Electron:** `npm start` (or `npx electron .`)
- **Build application:** `npm run build` (or `npx electron-builder`) then open application in `dist` folder
- **Run in shell:** `npm test` (or `node src/server.js`)

Be sure to accept MacOS requests to control your keyboard, as it is needed to simulate input.

### Join server

Players should enter the server's IP address into their web browser (default port 3000).

They must be on the same Wi-Fi network, unless your router is configured to allow devices to host outbound internet connections (not reccomended).

### Gameplay

Players should enter a username (between 3-20 alphanumeric characters default) into the username box.

After that, said user can start pressing keys.
Any unreserved key will be assigned to them after the first press, and only they will be able to press their assigned keys.
They can see those keys on the right side of the screen.

Keypresses will be sent to the host/server, which will parse them and emulate the same keypress in the current application.

Players can refresh the page to give up all your assigned key presses.

### Security concerns

As this program allows players on the same network to control the host's keyboard (limited to only their assigned keys, which could be all), it has some security concerns.

The host should always monitor what other people are typing and what is happening on their computer.

#### How to stop

If at any point someone malicious connects to your computer and starts pressing keys, there are several ways to stop the application:

- If another device has CollaboKeys Admin open, click the `stop` button in the `Controls` section.
- If CollaboKeys is running as an app, two-finger-click the app icon and click `Quit`. This also works if another app (e.g. Terminal or VS Code) is running CollaboKeys.
- If the above method is not working, you should use the Force Quit menu (`Command`+`Option`+`Escape`), select the app running CollaboKeys (see above), and click `Force Quit`.

## Is my game supported?

In order for a game to be supported by CollaboKeys, the following must all be true:

- The game only uses keypresses for input (no mouse)
- All keys used in the game are supported (see [Supported keys](#supported-keys) below)
- The game would work with input lag (no games that need a high response time)
- The game has a number of keys greater than or equal to the number of players

### Reccomended games

[**2048**](https://2048-online.io/) is a great game to play with multiple players.
Each player can get one or two keys, and they have to work together (or alone!) to play.

Keep in mind that there is quite a bit of lag between a player typing a key and it being emulated, due to AppleScript delay times.

## Supported keys

The `type.js` script only allows the following keys to be emulated:

- a-z, A-Z, 0-9
- `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`
- `-`, `_`, `=`, `+`
- `[`, `{`, `]`, `}`, `\`, `|`
- `;`, `:`, `'`, `"`, ``` ` ```, `~`
- `,`, `<`, `.`, `>`, `/`, `?`
- `space`, `return`
- arrow keys
- ~~`shift`~~, ~~`caps lock`~~, `delete`, `tab`, `command`, `option`, `control`, `esc` (*disabled by default*)
- F keys 1-20 (*disabled by default*)

All keys on a modern Mac laptop are supported, with the exeption of `fn` (as it is a low-level hardware modifier) and the power button.

See `src/keycodes.js` for more information on each key.

The `/keycodes` page also shows a table with all of the keys and their information outlined in `src/keycodes.js` as plain text.

## Console controls

Here are the following commands that can be run from the terminal. A `/` or other character is not needed to signal a command.

- **`stop`**: Terminates the process.
- **`pause`**: Disables emulation.
- **`resume`**: Enables emulation.
- **`uri`**: Shows the IP address of the host computer, with port.
- **`show <w/c>`**: Prints the warranty section of the license or the whole GNU GPLv3 license.
- **`waitingroom <admit/dismiss> <id/all>`**: Admits or dismisses someone from the waiting room.
- **`list <active/wr/waitingroom/all/nameless>`**: Lists player ids/names that are either currently active, in the waiting room, or both.
- **`key <revoke/enable/disable> <key/all>`**: Modifies a specific/every key to revoke it from everyone, or enable/disable it.
- **`keycodes`**: Prints a table of the current object in `src/keycodes.js`. *Admin page users are redirected to `/keycodes`.*

There are also various shorthands/aliases found in the `commandCallbacks()` function in `src/console.js`.

## Admin page

CollaboKeys supports an admin page that can be opened at any device, not just the host's computer.
They have to enter the admin password found at `src/config.json` (defualt is `hackathon2026`).

All controls supported by the console ([see section above](#console-controls)) can be used by the admin page, as well as a custom command box.
Those commands are the exact same as above.

## Configuration file

There is a configuration file at `src/config.json` with the following settings:

- **`"adminPage.enabled"`** *(defualt: `true`)*: Enable admin page (otherwise use CLI console)
- **`"adminPage.password"`** *(defualt: `"hackathon2026"`)*: Admin page password (if set to `""` then no password needed)
- **`"adminPage.autoAuthHost"`** *(defualt: `false`)*: Automatically authenticate the host (client IP = server IP)
- **`"app.preventDisplaySleep"`** *(default: `true`)*: Keep the display awake when CollaboKeys is open *(app only)*
- **`"app.splashScreenTime"`** *(default: `1000`)*: How long to show the splash screen for, minimum (milliseconds) *(app only)*
- **`"app.blankKeypressAtStart"`** *(default: `true`)*: Bring up emulation permissions dialogue at start *(app only)*
- **`"app.enableDevTools"`** *(default: `false`)*: Allow Chromium DevTools in app (not reccomended) *(app only)*
- **`"console.enabled"`** *(default: `true`)*: Enable CLI [console control commands](#console-controls)
- **`"player.name.minLength"`** *(defualt: `3`)*: Minimum length for a player's name to be (inclusive)
- **`"player.name.maxLength"`** *(defualt: `20`)*: Maximum length for a player's name to be (inclusive)
- **`"player.name.regex"`** *(defualt: `"[a-zA-Z0-9]"`)*: Test a player's name validity with this regular expression
- **`"player.waitRoomWhenJoined"`** *(defualt: `false`)*: Add new players to the wait room when joined
- **`"server.ports"`** *(defualt: `[3000, 8080, 8000]`, some more)*: Server ports in order of preference, otherwise random
- **`"server.restrictToLocalhost"`** *(defualt: `false`)*: Restrict clients to just `localhost`
- **`"allowEmulationAtStart"`** *(defualt: `true`)*: Enable key emulation at start for all players
- **`"autoAssignUnreservedKeys"`** *(defualt: `true`)*: Automatically assign unreserved keys when players press them

## To-do

No project is ever 100% complete.
Here is a list of things we need to do for CollaboKeys (no order):

- **FIX:** When player screen dims, they leave & rejoin but still are logged in
- Allow keys to be held
- Allow shift key to work
- Command to disable/enable global key reservation
- Admin page buttons for licensing info
- Sort this list by order!
- Document `electron` branch (desktop app! - beta)
- Show IP address / hostname on admin page (+ QR code?)
- maybe switch to log library (Winston)?
- add http data limit and add to config
- maybe add "keycode allowance presets"?
- remove `"autoAssignUnreservedKeys"` from config as no other eays to assign
