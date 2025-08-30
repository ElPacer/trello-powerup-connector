/* global TrelloPowerUp */
const t = window.TrelloPowerUp.iframe();

// Register at least one capability so Trello knows you're alive.
// This adds a simple button in the board header.
window.TrelloPowerUp.initialize({
  'board-buttons': function () {
    return [{
      icon: 'https://elpacer.github.io/trello-powerup-connector/PLG250.png',
      text: 'Hello from pacen json importer',
      callback: function (t) {
        return t.alert({ message: 'Click, Click - Checked! ✅', duration: 4 });
      }
    }];
  }
});
