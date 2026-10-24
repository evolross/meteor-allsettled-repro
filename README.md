# Promise.allSettled reconnect repro (Meteor 3.5.2)

Since Meteor 3.5, ddp-client re-sends outstanding methods after a reconnect through
`Promise.allSettled(...)`, and accounts-base's reconnect handler is async, so every logged-in client
calls `Promise.allSettled` on reconnect. Neither client runtime polyfills it. On a browser without it,
the reconnect throws and no method is ever sent again until the page reloads.

## Steps

```
meteor npm install
meteor
```

1. Open http://localhost:3000 and the browser console.
2. Run `await reproduce()`. It logs in, deletes `Promise.allSettled` (simulating an engine without it:
   Chrome < 76, Firefox < 71, Safari < 13), forces a reconnect that doesn't resume the DDP session, and
   calls a method.

   **Actual:** `Uncaught TypeError: Promise.allSettled is not a function`, then
   `4. Meteor.callAsync('ping') -> TIMED OUT after 10s -- the method was never sent`.

3. Reload, then run `await reproduce({ simulateMissingAllSettled: false })`.

   **Control:** `4. Meteor.callAsync('ping') -> pong`.

The app is `meteor create --minimal` plus `accounts-password`: a seeded user (`server/main.js`) and the
`reproduce()` helper (`client/main.js`).
