/* global TrelloPowerUp */
const t = window.TrelloPowerUp.initialize({
  'board-buttons': function () {
    return [{
      text: 'Import JSON',
      callback: (t) => t.popup({
        title: 'JSON Importer',
        url: './importer.html',   // relative to your connector origin
        height: 560
      })
    }];
  }
});


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

