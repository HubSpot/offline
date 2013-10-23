(function() {
  var TEMPLATE, createFromHTML, el, render;

  if (!window.Offline) {
    throw new Error("Offline UI brought in without offline.js");
  }

  TEMPLATE = '<div class="offline-ui"></div>';

  createFromHTML = function(html) {
    var el;
    el = document.createElement('div');
    el.innerHTML = html;
    return el.children[0];
  };

  el = null;

  (render = function() {
    if (el == null) {
      el = createFromHTML(TEMPLATE);
      document.body.appendChild(el);
    }
    if (Offline.state === 'up') {
      el.className = el.className.replace('offline-ui-down', '');
      return el.className += ' offline-ui-up';
    } else {
      el.className = el.className.replace('offline-ui-up', '');
      return el.className += ' offline-ui-down';
    }
  })();

  Offline.on('up down', render);

}).call(this);
