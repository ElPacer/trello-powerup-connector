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

/* global TrelloPowerUp */
const t = window.TrelloPowerUp.iframe();
const logEl = document.getElementById('log');
function log(line){ logEl.textContent += line + '\n'; }

const API_ROOT = 'https://api.trello.com/1';
let KEY = null;     // we’ll fetch this from your Power-Up config OR paste manually
let TOKEN = null;   // generated via t.authorize or your manual token flow

// --- 1) AUTH (recommended: use t.authorize per Trello docs) ---
document.getElementById('authorize').onclick = async () => {
  try {
    // If you prefer, you can skip this and hardcode KEY/TOKEN.
    await t.authorize(); // prompts Trello login/allow in a popup
    // After authorize, request a token for REST calls:
    const member = await trelloGET('/members/me');
    log('Authorized as: ' + member.username);
  } catch (e) {
    log('Authorize error: ' + e.message);
  }
};

// Helper to sign requests
async function trelloFetch(path, opts={}) {
  // If you’re not using t.authorize, set KEY/TOKEN manually.
  // With t.authorize, Trello injects token for REST via client library in some flows;
  // safest is to keep your KEY/TOKEN available yourself.
  if(!KEY || !TOKEN){
    // QUICK START: paste your key & token here if you are not using a more advanced flow:
    // KEY = 'YOUR_KEY_HERE';
    // TOKEN = 'YOUR_TOKEN_HERE';
  }
  const url = new URL(API_ROOT + path);
  url.searchParams.set('key', KEY);
  url.searchParams.set('token', TOKEN);
  return fetch(url.toString(), opts).then(r => {
    if(!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
    return r.json();
  });
}
const trelloGET   = (p)=>trelloFetch(p);
const trelloPOST  = (p,b)=>trelloFetch(p,{method:'POST', body: b instanceof FormData? b : null});
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

// --- 2) IMPORTER CORE ---
document.getElementById('import').onclick = async () => {
  try {
    const file = document.getElementById('file').files[0];
    if(!file){ alert('Choose a JSON file first.'); return; }
    const text = await file.text();
    const data = JSON.parse(text);

    // Expected schema (see section 2 below)
    // data = { name, labels?, lists:[{name, cards:[{name, desc?, labels?, checklists?}]}] }

    // 2.1 create board
    const board = await createBoard(data.name || 'Imported Board');
    log('Board created: ' + board.name + ' (' + board.id + ')');

    // 2.2 create labels (once per board) and map by name
    const labelIdByName = {};
    if (Array.isArray(data.labels)) {
      for (const L of data.labels) {
        const id = await createLabel(board.id, (L.name||'').toString(), (L.color||'').toString());
        labelIdByName[(L.name||'').toLowerCase()] = id;
        await sleep(40); // be nice to the API
      }
    }

    // 2.3 create lists in order, keep their ids
    const listIds = [];
    for (const list of (data.lists||[])) {
      const listId = await createList(board.id, list.name);
      listIds.push(listId);
      log(' List: ' + list.name + ' (' + listId + ')');
      await sleep(40);

      // 2.4 create cards in this list in order
      for (const card of (list.cards||[])) {
        const cardId = await createCard(listId, card.name, card.desc||'');
        log('   Card: ' + card.name + ' (' + cardId + ')');
        await sleep(40);

        // 2.4.1 add labels by name
        if (Array.isArray(card.labels)) {
          for (const lname of card.labels) {
            const idLabel = labelIdByName[(lname||'').toLowerCase()];
            if (idLabel) {
              await addLabelToCard(cardId, idLabel);
              await sleep(40);
            }
          }
        }

        // 2.4.2 add checklists + items
        if (Array.isArray(card.checklists)) {
          for (const cl of card.checklists) {
            const checklistId = await createChecklist(cardId, cl.name||'Checklist');
            await sleep(40);
            for (const item of (cl.items||[])) {
              await addChecklistItem(checklistId, item);
              await sleep(40);
            }
          }
        }
      }
    }

    log('✅ Import complete!');
    alert('Import complete!');
  } catch (e) {
    console.error(e);
    log('ERROR: ' + e.message);
    alert('Import failed. See log for details.');
  }
};

// --- API helpers ---
async function createBoard(name) {
  const url = `/boards/?name=${encodeURIComponent(name)}`;
  return trelloPOST(url, new FormData());
}
async function createList(boardId, name) {
  const url = `/lists?name=${encodeURIComponent(name)}&idBoard=${boardId}`;
  const res = await trelloPOST(url, new FormData());
  return res.id;
}
async function createCard(listId, name, desc) {
  const url = `/cards?idList=${listId}&name=${encodeURIComponent(name)}&desc=${encodeURIComponent(desc)}`;
  const res = await trelloPOST(url, new FormData());
  return res.id;
}
async function createLabel(boardId, name, color) {
  // Trello color must be one of: green, yellow, orange, red, purple, blue, sky, lime, pink, black
  const allowed = new Set(['green','yellow','orange','red','purple','blue','sky','lime','pink','black']);
  const use = allowed.has((color||'').toLowerCase()) ? color.toLowerCase() : 'blue';
  const url = `/labels?name=${encodeURIComponent(name)}&color=${use}&idBoard=${boardId}`;
  const res = await trelloPOST(url, new FormData());
  return res.id;
}
async function addLabelToCard(cardId, labelId) {
  const url = `/cards/${cardId}/idLabels?value=${labelId}`;
  return trelloPOST(url, new FormData());
}
async function createChecklist(cardId, name) {
  const url = `/checklists?idCard=${cardId}&name=${encodeURIComponent(name)}`;
  const res = await trelloPOST(url, new FormData());
  return res.id;
}
async function addChecklistItem(checklistId, name) {
  const url = `/checklists/${checklistId}/checkItems?name=${encodeURIComponent(name)}`;
  return trelloPOST(url, new FormData());
}

