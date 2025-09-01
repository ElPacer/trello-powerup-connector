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


const APP_KEY   = '';     // e.g. '2f1a...'
const APP_NAME  = 'Pacers JSON Importer';      // shown during auth consent
const APP_AUTHOR = 'Pacen Tools';

/* global TrelloPowerUp */
'use strict';

function pop(t, title, url, height=560){ return t.popup({ title, url, height }); }
async function ensureAuthThen(t, next){
  const api = await t.getRestApi();
  const ok  = await api.isAuthorized();
  if (!ok) await pop(t, 'Authorize', './authorize.html', 380);
  return next();
}

window.TrelloPowerUp.initialize({
  'board-buttons': (t) => ([
    { text: 'Import JSON',   callback: (t)=>ensureAuthThen(t, ()=>pop(t, 'JSON Importer', './importer.html', 640)) },
    { text: 'License & Billing', callback: (t)=>pop(t, 'License & Billing', './billing.html', 600) },
    { text: 'Authorize',     callback: (t)=>pop(t, 'Authorize', './authorize.html', 380) }
  ]),

  'authorization-status': async (t) => {
    try {
      const api = await t.getRestApi();
      return { authorized: await api.isAuthorized(), valid: true };
    } catch { return { authorized:false, valid:true }; }
  },

  'show-authorization': (t) => pop(t, 'Authorize Power-Up', './authorize.html', 380),
},{
  appKey: APP_KEY,
  appName: APP_NAME,
  appAuthor: APP_AUTHOR
});
