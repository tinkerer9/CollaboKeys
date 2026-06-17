# CollaboKeys

[![Platform](https://img.shields.io/badge/platform-macOS-blue)](#install)
[![Release](https://img.shields.io/github/v/release/tinkerer9/collaborativekeys)](https://github.com/tinkerer9/collaborativekeys/releases/latest)
[![License](https://img.shields.io/github/license/tinkerer9/collaborativekeys)](LICENSE)
[![Downloads](https://img.shields.io/github/downloads/tinkerer9/collaborativekeys/total)](https://github.com/tinkerer9/collaborativekeys/releases)
[![Stars](https://img.shields.io/github/stars/tinkerer9/collaborativekeys?style=flat)](https://github.com/tinkerer9/collaborativekeys/stargazers)

<!-- use "magick input.png -channel A -level 90,100% +channel -trim +repage output.png" to trim transparent border around window screenshot>
<!-- markdownlint-disable MD033 -->
<div align="center">
  <a href="https://github.com/tinkerer9/collaborativekeys/releases/latest">
    <img src="/images/screenshot.png" width="100%" alt="CollaboKeys Screenshot"><br>
  </a>
  <h3>Multiple players play any game by collaboratively sharing keyboard input</h3>
  <h4>
    ➡️ <a href="https://github.com/tinkerer9/collaborativekeys/releases/latest">Download CollaboKeys for free</a> ⬅️
  </h4>
</div>
<!-- markdownlint-enable MD033 -->

## Benefits

- 🎮 Play any keyboard-controlled game together
- 🌐 Join from any browser
- 🚫 No accounts required
- 📂 100% open source
- ⚡ Real-time input
- 🏆 2nd place hackathon winner

> *Made by [@tinkerer9](https://github.com/tinkerer9), [@LethalShadowFlame](https://github.com/LethalShadowFlame), and [@chickenlloyd](https://github.com/chickenlloyd) for a hackathon with theme Connection*.
> *We got 2nd place out of 14 teams!*

## Why CollaboKeys?

Unlike traditional remote-control software, every player only owns a subset of keys on a first come, first served basis.

This creates chaotic cooperative gameplay where players must work together to control a single computer.

## How it works

1. The host starts CollaboKeys on their Mac.
2. They share the server URL with their friends on the same network.
3. The host opens a game of their choosing on the foreground.
4. Each player assigns themselves keys that only they can press.
5. Together, the players control any game in real time.

Perfect for:

- racing games
- platformers
- puzzle games
- party games
- [and more!](#is-my-game-supported)

## Instructions

### Install

The host/server program is made to run on MacOS, but the client webpage should run on almost any computer.
Be sure to accept MacOS requests to control your keyboard, as it is needed to simulate input.

#### Download a release

Go to the [Releases](https://github.com/tinkerer9/collaborativekeys/releases/latest) section of this repository and download the `.dmg` file.
Open the disk image and drag CollaboKeys into your Applications folder.
Finally, open CollaboKeys!

#### Build CollaboKeys

Run the following commands in the terminal.

```bash
git clone https://github.com/tinkerer9/collaborativekeys.git
cd collaborativekeys
npm install
npm start
```

<!-- markdownlint-disable MD033 MD031 -->
<details>
  <summary>Other ways to run</summary>

  ```bash
  npm run build # save as an application and open in the "dist" folder
  npm test # or run in the terminal using terminal commands
  ```
</details>
<!-- markdownlint-enable MD033 MD031 -->

### Join server

Players should enter the server's IP address into their web browser.
This address can be found by clicking the `show link` button on the admin page.

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

### Logging

CollaboKeys uses `winston` for logging.
See [`src/log.js`](src/log.js) for more details, such as log levels.

#### Log files

Logs are sent to the `logs/` folder in the project directory, with three log files by default:

- **`error.log`:** Contains all error logs (major issues in the program, e.g. emulation failure)
- **`warn.log`:** Contains all warning logs (minor issues in the program, e.g. wrong operating system)
- **`combined.log`:** Contains the above as well as info logs (player actions e.g. keypress)

#### Admin page logs

The [admin page](#admin-page) has a logs section for error, warning, info, and HTTP logs.
*(HTTP logs are made when a client connects or disconnects the CollaboKeys server.)*
These can be cleared with the `clear logs` button.

#### Log pages

CollaboKeys has log pages at `/logs`.
Directly visiting `/logs` shows the combined logs ([see above](#log-files)).

Clients can also visit `/logs/error`, `/logs/warn`, or any other name of a log file.
If there isn't a matching log file, the log page won't show.

## Is my game supported?

In order for a game to be supported by CollaboKeys, the following must all be true:

- The game only uses keypresses for input (no mouse)
- All keys used in the game are supported (see [Supported keys](#supported-keys) below)
- The game would work with input lag (no games that need a high response time)
- The game has a number of keys greater than or equal to the number of players

## Supported keys

The [`type.js`](src/type.js) script only allows the following keys to be emulated:

<!-- markdownlint-disable MD033 -->
- a-z, A-Z, 0-9
- <kbd>!</kbd>, <kbd>@</kbd>, <kbd>#</kbd>, <kbd>$</kbd>, <kbd>%</kbd>, <kbd>^</kbd>, <kbd>&amp;</kbd>, <kbd>*</kbd>, <kbd>(</kbd>, <kbd>)</kbd>
- <kbd>-</kbd>, <kbd>_</kbd>, <kbd>=</kbd>, <kbd>+</kbd>
- <kbd>[</kbd>, <kbd>]</kbd>, <kbd>&lcub;</kbd>, <kbd>&rcub;</kbd>, <kbd>&bsol;</kbd>, <kbd>|</kbd>
- <kbd>;</kbd>, <kbd>:</kbd>, <kbd>'</kbd>, <kbd>"</kbd>, <kbd>`</kbd>, <kbd>~</kbd>
- <kbd>,</kbd>, <kbd>.</kbd>, <kbd>&lt;</kbd>, <kbd>&gt;</kbd>, <kbd>/</kbd>, <kbd>?</kbd>
- <kbd>space</kbd>, <kbd>return</kbd>
- <kbd>shift</kbd>, <kbd>caps lock</kbd>, <kbd>delete</kbd>, <kbd>tab</kbd>, <kbd>command</kbd>, <kbd>option</kbd>, <kbd>control</kbd>, <kbd>esc</kbd> (*disabled by default*)
- arrow keys
- F keys 1-20 (*disabled by default*)
<!-- markdownlint-enable MD033 -->

All keys on a modern Mac laptop are supported, with the exeption of `fn` (as it is a low-level hardware modifier) and the power button.

See [`keycodes.js`](src/keycodes.js) for more information on each key.

The `/keycodes` page also shows a table with all of the keys and their information outlined in [`keycodes.js`](src/keycodes.js) as plain text.

## Console controls

Here are the following commands that can be run from the terminal. A `/` or other character is not needed to signal a command.

- **`stop`**: Terminates the process.
- **`enable <emulation/reservation>`**: Enables emulation or automatic key reservation.
- **`disable <emulation/reservation>`**: Disables emulation or automatic key reservation.
- **`press`**: Emulates a keypress with the given argument.
- **`echo`**: Returns the inputs given (similar to the `echo` command line tool)
- **`uri`**: Shows the IP address of the host computer, with port.
- **`show <w/c>`**: Prints the warranty section of the license or the whole GNU GPLv3 license.
- **`waitingroom <admit/dismiss> <id/all>`**: Admits or dismisses someone from the waiting room.
- **`list <active/wr/waitingroom/all/nameless>`**: Lists players and information about them.
- **`key <revoke/enable/disable> <key/all>`**: Modifies a specific/every key to revoke it from everyone, or enable/disable it.
- **`keycodes`**: Prints a table of the current object in [`keycodes.js`](src/keycodes.js). *Admin page users are redirected to `/keycodes`.*

There are also various shorthands/aliases found in the `commandCallbacks()` function in [`console.js`](src/console.js).

## Admin page

CollaboKeys supports an admin page that can be opened at any device, not just the host's computer.
They have to enter the admin password found in the [configuration file](#configuration-file)

All controls supported by the console ([see section above](#console-controls)) can be used by the admin page, as well as a custom command box.
Those commands are the exact same as above.

## Configuration file

There is a configuration file at [`src/config.json`](src/config.json) with the following settings:

- **`"adminPage.enabled"`** *(default: `true`)*: Enable admin page (otherwise use CLI console)
- **`"adminPage.password"`** *(default: `""`)*: Admin page password (if set to `""` then no password needed)
- **`"adminPage.autoAuthHost"`** *(default: `false`)*: Automatically authenticate the host (client IP = server IP)
- **`"app.preventDisplaySleep"`** *(default: `true`)*: Keep the display awake when CollaboKeys is open *(app only)*
- **`"app.splashScreenTime"`** *(default: `1000`)*: How long to show the splash screen for, minimum (milliseconds) *(app only)*
- **`"app.enableDevTools"`** *(default: `false`)*: Allow Chromium DevTools in app (not reccomended) *(app only)*
- **`"console.enabled"`** *(default: `true`)*: Enable CLI [console control commands](#console-controls)
- **`"logs.logPage.enabled"`** *(default: `true`)*: Enable [log pages](#log-pages)
- **`"logs.logFileTypes"`** *(default: see file)*: An array of names of files & types to save
- **`"logs.deleteAtStart"`** *(default: `false`)*: Clear all log files at start of program
- **`"player.name.minLength"`** *(default: `3`)*: Minimum length for a player's name to be (inclusive)
- **`"player.name.maxLength"`** *(default: `20`)*: Maximum length for a player's name to be (inclusive)
- **`"player.name.regex"`** *(default: `"[a-zA-Z0-9]"`)*: Test a player's name validity with this regular expression
- **`"player.waitRoomWhenJoined"`** *(default: `false`)*: Add new players to the wait room when joined
- **`"player.maxReservedKeys"`** *(default: `0`)*: Limit the number of keys each player can reserve (no limit if set to `0`)
- **`"server.ports"`** *(default: `[3000, 8080, 8000]`, some more)*: Server ports in order of preference, otherwise random
- **`"server.restrictToLocalhost"`** *(default: `false`)*: Restrict clients to just `localhost`
- **`"allowEmulationAtStart"`** *(default: `true`)*: Enable key emulation at start for all players
- **`"allowReservationAtStart"`** *(default: `true`)*: Automatically assign unreserved keys when players press them at start

## To-do

No project is ever 100% complete.
Here is a list of things we need to do for CollaboKeys (no order):

- **FIX: DMGs show they're corrupted when opened&mdash;possibly because they're not signed?**
- **Sign & notarize the Electron app**
- **Add automated releases**
- **FIX: When player screen dims, they leave & rejoin but still are logged in**
- Allow keys to be held (keyboard.js architecture already in place)
- add http data limit and add to config
- maybe add "keycode allowance presets"?
