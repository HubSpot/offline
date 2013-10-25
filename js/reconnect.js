(function() {
  var down, next, nope, rc, reset, retryIntv, tick, tryNow, up;

  if (!window.Offline) {
    throw new Error("Offline Reconnect brought in without offline.js");
  }

  rc = {};

  retryIntv = null;

  reset = function() {
    var _ref;
    if (rc.state != null) {
      Offline.trigger('reconnect:stopped');
    }
    rc.state = 'inactive';
    return rc.remaining = rc.delay = (_ref = Offline.getOption('reconnect.initialDelay')) != null ? _ref : 3;
  };

  next = function() {
    var delay, _ref;
    delay = (_ref = Offline.getOption('reconnect.delay')) != null ? _ref : Math.min(Math.ceil(rc.delay * 1.5), 3600);
    return rc.remaining = rc.delay = delay;
  };

  tick = function() {
    if (rc.state === 'connecting') {
      return;
    }
    rc.remaining -= 1;
    Offline.trigger('reconnect:tick');
    if (rc.remaining === 0) {
      return tryNow();
    }
  };

  tryNow = function() {
    if (rc.state !== 'waiting') {
      return;
    }
    Offline.trigger('reconnect:connecting');
    rc.state = 'connecting';
    return Offline.check();
  };

  down = function() {
    rc.state = 'waiting';
    Offline.trigger('reconnect:started');
    return retryIntv = setInterval(tick, 1000);
  };

  up = function() {
    clearInterval(retryIntv);
    return reset();
  };

  nope = function() {
    if (rc.state === 'connecting') {
      Offline.trigger('reconnect:failure');
      rc.state = 'waiting';
      return next();
    }
  };

  rc.tryNow = tryNow;

  setTimeout(function() {
    if (Offline.getOption('reconnect') !== false) {
      reset();
      Offline.on('down', down);
      Offline.on('confirmed-down', nope);
      Offline.on('up', up);
      return Offline.reconnect = rc;
    }
  }, 0);

}).call(this);
