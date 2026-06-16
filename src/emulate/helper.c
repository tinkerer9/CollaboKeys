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
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void send_key(int keycode, bool shift) {
    CGEventFlags flags = shift ? kCGEventFlagMaskShift : 0;

    CGEventRef down = CGEventCreateKeyboardEvent(NULL, keycode, true);
    CGEventRef up   = CGEventCreateKeyboardEvent(NULL, keycode, false);

    if (!down || !up) {
        fprintf(stderr, "Failed to create keyboard event\n");
        return;
    }

    CGEventSetFlags(down, flags);
    CGEventSetFlags(up, flags);

    CGEventPost(kCGHIDEventTap, down);
    CGEventPost(kCGHIDEventTap, up);

    CFRelease(down);
    CFRelease(up);
}

int main(void) {
    int keycode;
    int shift;

    while (scanf("%d %d", &keycode, &shift) == 2) {
        send_key(keycode, shift != 0);
    }

    return 0;
}