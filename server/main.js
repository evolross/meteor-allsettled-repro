import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { getMinimumBrowserVersions } from "meteor/modern-browsers";

//  A user to log in as -- the bug only shows for a logged-in client, because accounts-base's
//  (async) reconnect hook is what makes ddp-client call Promise.allSettled on reconnect.
const REPRO_EMAIL = "repro@example.com";
const REPRO_PASSWORD = "repro-password";

Meteor.methods({
  ping() {
    return "pong";
  },
});

Meteor.startup(async () => {
  if (!(await Accounts.findUserByEmail(REPRO_EMAIL))) {
    await Accounts.createUserAsync({ email: REPRO_EMAIL, password: REPRO_PASSWORD });
  }

  //  Browsers below these minimums are served web.browser.legacy
  const { chrome, firefox, safari, mobileSafari } = getMinimumBrowserVersions();
  console.log("Modern bundle minimums:", JSON.stringify({ chrome, firefox, safari, mobileSafari }));
});
