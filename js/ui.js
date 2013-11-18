(function() {
  var RETRY_TEMPLATE, TEMPLATE, addClass, content, createFromHTML, el, flashClass, flashTimeouts, formatTime, init, removeClass, render, _onreadystatechange, _ref;

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

  formatTime = function(sec, long) {
    var formatters, longUnits, mult, out, unit, val;
    if (long == null) {
      long = false;
    }
    if (sec === 0) {
      return 'now';
    }
    formatters = {
      'd': 86400,
      'h': 3600,
      'm': 60,
      's': 1
    };
    longUnits = {
      's': 'second',
      'm': 'minute',
      'h': 'hour',
      'd': 'day'
    };
    out = '';
    for (unit in formatters) {
      mult = formatters[unit];
      if (sec >= mult) {
        val = Math.floor(sec / mult);
        if (long) {
          unit = " " + longUnits[unit];
          if (val !== 1) {
            unit += 's';
          }
        }
        return "" + val + unit;
      }
    }
  };

  render = function() {
    var button, handler;
    el = createFromHTML(TEMPLATE);
    document.body.appendChild(el);
    if ((Offline.reconnect != null) && Offline.getOption('reconnect')) {
      el.appendChild(createFromHTML(RETRY_TEMPLATE));
      button = el.querySelector('.offline-ui-retry');
      handler = function(e) {
        e.preventDefault();
        return Offline.reconnect.tryNow();
      };
      if (button.addEventListener != null) {
        button.addEventListener('click', handler, false);
      } else {
        button.attachEvent('click', handler);
      }
    }
    addClass("offline-ui-" + Offline.state);
    return content = el.querySelector('.offline-ui-content');
  };

  init = function() {
    render();
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
      content.setAttribute('data-retry-in-abbr', formatTime(Offline.reconnect.remaining));
      return content.setAttribute('data-retry-in', formatTime(Offline.reconnect.remaining, true));
    });
    Offline.on('reconnect:stopped', function() {
      removeClass('offline-ui-connecting offline-ui-waiting');
      content.setAttribute('data-retry-in-seconds', null);
      content.setAttribute('data-retry-in-abbr', null);
      return content.setAttribute('data-retry-in', null);
    });
    Offline.on('reconnect:failure', function() {
      flashClass('offline-ui-reconnect-failed-2s', 2);
      return flashClass('offline-ui-reconnect-failed-5s', 5);
    });
    return Offline.on('reconnect:success', function() {
      flashClass('offline-ui-reconnect-succeeded-2s', 2);
      return flashClass('offline-ui-reconnect-succeeded-5s', 5);
    });
  };

  if ((_ref = document.readyState) === 'interactive' || _ref === 'complete') {
    init();
  } else if (document.addEventListener != null) {
    document.addEventListener('DOMContentLoaded', init, false);
  } else {
    _onreadystatechange = document.onreadystatechange;
    document.onreadystatechange = function() {
      if (document.readyState === 'complete') {
        init();
      }
      return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
    };
  }

}).call(this);
