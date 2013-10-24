(function() {
  var RETRY_TEMPLATE, TEMPLATE, addClass, content, createFromHTML, el, flashClass, flashTimeouts, formatTime, removeClass, render;

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

  el = content = null;

  addClass = function(name) {
    removeClass(name);
    return el.className += " " + name;
  };

  removeClass = function(name) {
    return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
  };

  flashTimeouts = {};

  flashClass = function(name, time) {
    addClass(name);
    if (flashTimeouts[name] != null) {
      clearTimeout(flashTimeouts[name]);
    }
    return flashTimeouts[name] = setTimeout(function() {
      removeClass(name);
      return delete flashTimeouts[name];
    }, time * 1000);
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

  (render = function() {
    el = createFromHTML(TEMPLATE);
    document.body.appendChild(el);
    if (Offline.reconnect != null) {
      el.appendChild(createFromHTML(RETRY_TEMPLATE));
      el.querySelector('.offline-ui-retry').addEventListener('click', function(e) {
        e.preventDefault();
        return Offline.reconnect.tryNow();
      }, false);
    }
    addClass("offline-ui-" + Offline.state);
    return content = el.querySelector('.offline-ui-content');
  })();

  Offline.on('up', function() {
    removeClass('offline-ui-down');
    addClass('offline-ui-up');
    flashClass('offline-ui-up-2s', 2);
    return flashClass('offline-ui-up-5s', 5);
  });

  Offline.on('down', function() {
    removeClass('offline-ui-up');
    addClass('offline-ui-down');
    flashClass('offline-ui-down-2s', 2);
    return flashClass('offline-ui-down-5s', 5);
  });

  Offline.on('reconnect:connecting', function() {
    addClass('offline-ui-connecting');
    return removeClass('offline-ui-waiting');
  });

  Offline.on('reconnect:tick', function() {
    addClass('offline-ui-waiting');
    removeClass('offline-ui-connecting');
    content.setAttribute('data-retry-in-seconds', Offline.reconnect.remaining);
    return content.setAttribute('data-retry-in', formatTime(Offline.reconnect.remaining));
  });

  Offline.on('reconnect:stopped', function() {
    removeClass('offline-ui-connecting offline-ui-waiting');
    content.setAttribute('data-retry-in-seconds', null);
    return content.setAttribute('data-retry-in', null);
  });

  Offline.on('reconnect:failure', function() {
    flashClass('offline-ui-reconnect-failed-2s', 2);
    return flashClass('offline-ui-reconnect-failed-5s', 5);
  });

  Offline.on('reconnect:success', function() {
    flashClass('offline-ui-reconnect-succeeded-2s', 2);
    return flashClass('offline-ui-reconnect-succeeded-5s', 5);
  });

}).call(this);
