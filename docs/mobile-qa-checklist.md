# Mobile QA checklist

The Playwright suite (`npm run test:e2e:mobile`) covers geometry: horizontal
overflow, 16px form fields, 44px touch targets, and overlays colliding with the
bottom tab bar. Everything below needs a real device, because emulators get the
keyboard, the safe area and standalone PWA mode wrong.

Run this on one iPhone (Safari) and one Android (Chrome) before each release.

## Setup

- Add a throwaway account's credentials to `PLAYWRIGHT_TEST_EMAIL` /
  `PLAYWRIGHT_TEST_PASSWORD` so the authenticated half of the smoke suite runs;
  without them it skips.
- Test in both browser tab and installed (standalone) PWA mode — the safe-area
  insets differ between the two.

## Keyboard

- [ ] Copilot composer (`/dashboard/copilot`): focusing the textarea does not
      zoom the page, and the composer stays above the keyboard as the message
      grows. It should cap at ~30% of the visible viewport, not 200px.
- [ ] Genesis wizard (`/new-project`): the sticky footer's next/back buttons
      stay reachable with the keyboard open.
- [ ] SMB CRUD dialogs (staff, menu, expenses, inventory…): the dialog scrolls
      to the focused field instead of pushing it under the keyboard.
- [ ] Search inputs on `/dashboard/help` and the content calendar stats bar do
      not trigger zoom-on-focus.

## Safe area

- [ ] Bottom tab bar clears the home indicator on a notched iPhone.
- [ ] Auth pages, the Genesis wizard header, and the teleprompter footer clear
      the notch and the home indicator.
- [ ] Rotate to landscape: the manifest no longer locks orientation, so the
      shell must survive it. Check the canvas board and teleprompter.

## Standalone PWA

- [ ] Install from the banner, launch from the home screen, confirm there is no
      desktop-shell flash on first paint of a dashboard route.
- [ ] The service-worker update prompt appears as a toast (this was silently
      swallowed before the `<Toaster />` was mounted).
- [ ] Offline: navigating to a cached route works and save failures surface a
      toast rather than failing silently.

## Interruptions

- [ ] Fresh session: no tour auto-starts. It launches only from Help or the `?`
      button.
- [ ] Only one of {tour, cookie banner, PWA banner, re-engagement nudge,
      Genesis coach, feedback FAB} is visible at a time.
- [ ] "Don't show again" survives a full app restart.

## Touch surfaces

- [ ] Canvas (`/dashboard/canvas`): pinch-zoom and pan work, the board fits the
      viewport on first load, and the zoom controls do not sit under the nav.
- [ ] Content calendar: tapping a day opens the agenda sheet; the month grid is
      readable at 360px.
- [ ] Roadmap: the toolbar tabs scroll horizontally without trapping the page
      scroll.
