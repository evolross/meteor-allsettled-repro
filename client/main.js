import { Meteor } from "meteor/meteor";

//  Run `await reproduce()` in the browser console -- see README.md.
//  `await reproduce({ simulateMissingAllSettled: false })` is the control.
window.reproduce = async function ({ simulateMissingAllSettled = true } = {}) {
  await new Promise((resolve, reject) =>
    Meteor.loginWithPassword("repro@example.com", "repro-password", (error) => (error ? reject(error) : resolve()))
  );
  console.log("1. logged in as", Meteor.userId());

  if (simulateMissingAllSettled) {
    //  Simulate an engine without Promise.allSettled (Chrome < 76, Firefox < 71, Safari < 13)
    delete Promise.allSettled;
    console.log("2. deleted Promise.allSettled");
  }

  //  A reconnect that doesn't resume the DDP session: Meteor.disconnect() sends DDP's graceful
  //  {msg: 'disconnect'}, so the server drops the session, and reconnecting runs the reconnect hooks.
  //  (A network drop longer than the 15s resumption grace period, or a server restart, does the same.)
  Meteor.disconnect();
  Meteor.reconnect();
  await new Promise((resolve) => {
    const poll = setInterval(() => {
      if (Meteor.status().connected) {
        clearInterval(poll);
        resolve();
      }
    }, 50);
  });
  console.log("3. reconnected");

  const result = await Promise.race([
    Meteor.callAsync("ping"),
    new Promise((resolve) => setTimeout(() => resolve("TIMED OUT after 10s -- the method was never sent"), 10000)),
  ]);
  console.log("4. Meteor.callAsync('ping') ->", result);
  return result;
};
