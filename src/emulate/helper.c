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

/* Uses a persistent helper to press keys */

#include <ApplicationServices/ApplicationServices.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>
#include <unistd.h>
#include <errno.h>

typedef struct __attribute__((packed)) {
    uint16_t keycode;
    uint8_t event_type;
} KeyEvent;

#define EVENT_KEY_DOWN  1
#define EVENT_KEY_UP    2
#define EVENT_KEY_PRESS 3

static void post_key(uint16_t keycode, bool down) {
    CGEventRef event =
        CGEventCreateKeyboardEvent(NULL, keycode, down);
    if (!event) {
        fprintf(stderr, "EVENT_CREATE_FAILED\n");
        fflush(stderr);
        return;
    }
    CGEventPost(kCGHIDEventTap, event);
    CFRelease(event);
}

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