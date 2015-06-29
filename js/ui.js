(function() {
  var RETRY_TEMPLATE, TEMPLATE, _onreadystatechange, addClass, content, createFromHTML, el, flashClass, flashTimeouts, init, removeClass, render, roundTime;

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

  roundTime = function(sec) {
    var mult, unit, units, val;
    units = {
      'day': 86400,
      'hour': 3600,
      'minute': 60,
      'second': 1
    };
    for (unit in units) {
      mult = units[unit];
      if (sec >= mult) {
        val = Math.floor(sec / mult);
        return [val, unit];
      }
    }
    return ['now', ''];
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
      var ref, time, unit;
      addClass('offline-ui-waiting');
      removeClass('offline-ui-connecting');
      ref = roundTime(Offline.reconnect.remaining), time = ref[0], unit = ref[1];
      content.setAttribute('data-retry-in-value', time);
      return content.setAttribute('data-retry-in-unit', unit);
    });
    Offline.on('reconnect:stopped', function() {
      removeClass('offline-ui-connecting offline-ui-waiting');
      content.setAttribute('data-retry-in-value', null);
      return content.setAttribute('data-retry-in-unit', null);
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

  if (document.readyState === 'complete') {
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
