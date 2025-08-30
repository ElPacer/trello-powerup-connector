/* global TrelloPowerUp */
const t = window.TrelloPowerUp.iframe();

// Register at least one capability so Trello knows you're alive.
// This adds a simple button in the board header.
window.TrelloPowerUp.initialize({
  'board-buttons': function () {
    return [{
     // icon: 'https://raw.githubusercontent.com/github/explore/main/topics/trello/trello.png',
      text: 'Hello from Power-Up',
      callback: function (t) {
        return t.alert({ message: 'It works! ✅', duration: 4 });
      }
    }];
  }
});
