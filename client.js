/* global TrelloPowerUp */
const t = window.TrelloPowerUp.iframe();

window.TrelloPowerUp.initialize({
  'board-buttons': function () {
    return [{
      text: 'Click Me!',
      callback: function (t) {
        return t.alert({ message: 'It works! ✅', duration: 4 });
      }
    }];
  }
});
