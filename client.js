/*
 * Copyright (c) 2025 Pacen Life Games. All rights reserved.
 *
 * This software and associated documentation files (the "Software") are the 
 * confidential and proprietary information of Pacen Life Games ("Company"). 
 * You shall not disclose or distribute the Software in whole or in part 
 * without the prior written permission of the Company.
 *
 * The Software is provided "AS IS", without warranty of any kind, express or 
 * implied, including but not limited to the warranties of merchantability, 
 * fitness for a particular purpose, and noninfringement. In no event shall 
 * the Company or its contributors be liable for any claim, damages, or other 
 * liability, whether in an action of contract, tort, or otherwise, arising 
 * from, out of, or in connection with the Software or the use or other 
 * dealings in the Software.
 */


const APP_KEY   = 'YOUR_TRELLO_APP_KEY';     // e.g. '2f1a...'
const APP_NAME  = 'Pacers JSON Importer';      // shown during auth consent
// optional but harmless:
const APP_AUTHOR = 'Pacen Tools';

// --- tiny logger overlay (safe in prod; remove if you like) ---
const log = (...args) => {
  try {
    // eslint-disable-next-line no-console
    console.log('[Power-Up]', ...args);
  } catch (_) {}
};

/**
 * Open our small “Authorize” popup (loads authorize.html).
 * The actual authorize() happens INSIDE authorize.html on a user click.
 */
function openAuthorizePopup(t, title = 'Authorize') {
  return t.popup({
    title,
    url: './authorize.html',
    height: 360
  });
}

/**
 * Open our JSON Importer UI popup.
 * importer.html will do isAuthorized() checks and run the import.
 */
function openImporterPopup(t) {
  return t.popup({
    title: 'JSON Importer',
    url: './importer.html',
    height: 560
  });
}

/**
 * OPTIONAL: a quick helper that ensures we’re authorized before
 * opening the importer. If not authorized, we prompt auth first.
 * (You can call this from a separate button if you want a one-click flow.)
 */
async function ensureAuthThenImporter(t) {
  const api = await t.getRestApi();
  const ok = await api.isAuthorized();
  if (!ok) {
    await openAuthorizePopup(t, 'Authorize to Continue');
  }
  return openImporterPopup(t);
}

// =====================================
// 2) REGISTER CAPABILITIES WITH Trello
// =====================================

window.TrelloPowerUp.initialize(
  {
    /**
     * BOARD BUTTONS
     * Keep this lightweight: no network work here.
     * Only open popups; real work happens inside those popups.
     */
    'board-buttons': function (t) {
      return [
        {
          // Primary entry point to your importer
          text: 'Import JSON',
          // tip: you can add an icon by URL: icon: 'https://.../icon.png'
          callback: function (t) {
            // Either require explicit auth first…
            // return openAuthorizePopup(t).then(() => openImporterPopup(t));

            // …or do the friendly ensure-auth-then-importer flow:
            return ensureAuthThenImporter(t);
          }
        },
        {
          // A dedicated “Authorize” button (nice for first-time users)
          text: 'Authorize',
          callback: function (t) {
            return openAuthorizePopup(t);
          }
        }
      ];
    },

    /**
     * AUTHORIZATION STATUS
     * Lets Trello show the “Authorize” chip in the Power-Up UI.
     * Return { authorized: true/false }.
     */
    'authorization-status': async function (t) {
      try {
        const api = await t.getRestApi();
        const ok = await api.isAuthorized();
        return { authorized: !!ok, valid: true };
      } catch (e) {
        log('authorization-status error:', e);
        // If something goes wrong, show as not authorized (no crash)
        return { authorized: false, valid: true };
      }
    },

    /**
     * SHOW AUTHORIZATION
     * Trello calls this when the user clicks its built-in “Authorize” chip.
     * We should open our auth popup.
     */
    'show-authorization': function (t) {
      return openAuthorizePopup(t, 'Authorize Power-Up');
    }

    // You can add more capabilities later (card-buttons, card-badges, show-settings, etc.)
  },

  /**
   * Initialization options (REQUIRED for REST client)
   * Passing appKey/appName here unlocks t.getRestApi()
   */
  {
    appKey: APP_KEY,
    appName: APP_NAME,
    appAuthor: APP_AUTHOR
  }
);

// Optional: surface uncaught errors (useful during development)
window.addEventListener('error', (e) => log('Window error:', e.message));
window.addEventListener('unhandledrejection', (e) => log('Unhandled promise:', (e.reason && e.reason.message) || e.reason));
