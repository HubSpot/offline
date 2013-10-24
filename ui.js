(function() {
  var RETRY_TEMPLATE, TEMPLATE, addClass, createFromHTML, el, formatTime, reconnectFailureTimeouts, reconnectSuccessTimeouts, removeClass, render;

  if (!window.Offline) {
    throw new Error("Offline UI brought in without offline.js");
  }

  TEMPLATE = '<div class="offline-ui"><div class="offline-ui-content"></div></div>';

  RETRY_TEMPLATE = '<a href class="offline-ui-retry"></a>';

  createFromHTML = function(html) {
    var el;
    el = document.createElement('div');
    el.innerHTML = html;
    return el.children[0];
  };

  addClass = function(el, name) {
    removeClass(el, name);
    return el.className += " " + name;
  };

  removeClass = function(el, name) {
    return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
  };

  formatTime = function(sec) {
    var formatters, letter, mult, out;
    formatters = {
      'd': 86400,
      'h': 3600,
      'm': 60,
      's': 1
    };
    out = '';
    for (letter in formatters) {
      mult = formatters[letter];
      if (sec >= mult) {
        out += "" + (Math.floor(sec / mult)) + letter + " ";
        sec = sec % mult;
      }
    }
    out || (out = 'now');
    return out.trim();
  };

  el = null;

  (render = function() {
    if (el == null) {
      el = createFromHTML(TEMPLATE);
      document.body.appendChild(el);
      if (Offline.reconnect != null) {
        el.appendChild(createFromHTML(RETRY_TEMPLATE));
        el.querySelector('.offline-ui-retry').addEventListener('click', function(e) {
          e.preventDefault();
          return Offline.reconnect.tryNow();
        }, false);
      }
    }
    if (Offline.state === 'up') {
      removeClass(el, 'offline-ui-down');
      return addClass(el, 'offline-ui-up');
    } else {
      removeClass(el, 'offline-ui-up');
      return addClass(el, 'offline-ui-down');
    }
  })();

  Offline.on('reconnect:connecting', function() {
    addClass(el, 'offline-ui-connecting');
    return removeClass(el, 'offline-ui-waiting');
  });

  Offline.on('reconnect:tick', function() {
    addClass(el, 'offline-ui-waiting');
    removeClass(el, 'offline-ui-connecting');
    el.querySelector('.offline-ui-content').setAttribute('data-retry-in-seconds', Offline.reconnect.remaining);
    return el.querySelector('.offline-ui-content').setAttribute('data-retry-in', formatTime(Offline.reconnect.remaining));
  });

  Offline.on('reconnect:stopped', function() {
    removeClass(el, 'offline-ui-connecting offline-ui-waiting');
    el.querySelector('.offline-ui-content').setAttribute('data-retry-in-seconds', null);
    return el.querySelector('.offline-ui-content').setAttribute('data-retry-in', null);
  });

  reconnectFailureTimeouts = [];

  Offline.on('reconnect:failure', function() {
    var timeout, _i, _len;
    addClass(el, 'offline-ui-reconnect-failed-2s offline-ui-reconnect-failed-5s');
    for (_i = 0, _len = reconnectFailureTimeouts.length; _i < _len; _i++) {
      timeout = reconnectFailureTimeouts[_i];
      clearTimeout(timeout);
    }
    reconnectFailureTimeouts = [];
    reconnectFailureTimeouts.push(setTimeout(function() {
      return removeClass(el, 'offline-ui-reconnect-failed-2s');
    }, 2000));
    return reconnectFailureTimeouts.push(setTimeout(function() {
      return removeClass(el, 'offline-ui-reconnect-failed-5s');
    }, 5000));
  });

  reconnectSuccessTimeouts = [];

  Offline.on('reconnect:success', function() {
    var timeout, _i, _len;
    addClass(el, 'offline-ui-reconnect-succeeded-2s offline-ui-reconnect-succeeded-5s');
    for (_i = 0, _len = reconnectSuccessTimeouts.length; _i < _len; _i++) {
      timeout = reconnectSuccessTimeouts[_i];
      clearTimeout(timeout);
    }
    reconnectSuccessTimeouts = [];
    reconnectSuccessTimeouts.push(setTimeout(function() {
      return removeClass('offline-ui-reconnect-succeeded-2s');
    }, 2000));
    return reconnectSuccessTimeouts.push(setTimeout(function() {
      return removeClass('offline-ui-reconnect-succeeded-5s');
    }, 5000));
  });

  Offline.on('up down', render);

}).call(this);
