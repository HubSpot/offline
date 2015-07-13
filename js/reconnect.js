(function() {
  var down, next, nope, rc, reset, retryIntv, tick, tryNow, up;

  if (!window.Offline) {
    throw new Error("Offline Reconnect brought in without offline.js");
  }

  rc = Offline.reconnect = {};

  retryIntv = null;

  reset = function() {
    var ref;
    if ((rc.state != null) && rc.state !== 'inactive') {
      Offline.trigger('reconnect:stopped');
    }
    rc.state = 'inactive';
    return rc.remaining = rc.delay = (ref = Offline.getOption('reconnect.initialDelay')) != null ? ref : 3;
  };

  next = function() {
    var delay, ref;
    delay = (ref = Offline.getOption('reconnect.delay')) != null ? ref : Math.min(Math.ceil(rc.delay * 1.5), 3600);
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
    if (!Offline.getOption('reconnect')) {
      return;
    }
    reset();
    rc.state = 'waiting';
    Offline.trigger('reconnect:started');
    return retryIntv = setInterval(tick, 1000);
  };

  up = function() {
    if (retryIntv != null) {
      clearInterval(retryIntv);
    }
    return reset();
  };

  nope = function() {
    if (!Offline.getOption('reconnect')) {
      return;
    }
    if (rc.state === 'connecting') {
      Offline.trigger('reconnect:failure');
      rc.state = 'waiting';
      return next();
    }
  };

  rc.tryNow = tryNow;

  reset();

  Offline.on('down', down);

  Offline.on('confirmed-down', nope);

  Offline.on('up', up);

}).call(this);
