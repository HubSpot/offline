(function() {
  var INITIAL_DELAY, down, next, nope, rc, reset, retryIntv, tick, up;

  if (!window.Offline) {
    throw new Error("Offline Reconnect brought in without offline.js");
  }

  INITIAL_DELAY = 3;

  rc = Offline.reconnect = {};

  retryIntv = null;

  (reset = function() {
    if (rc.state != null) {
      Offline.trigger('reconnect:stopped');
    }
    rc.state = 'inactive';
    return rc.remaining = rc.delay = INITIAL_DELAY;
  })();

  next = function() {
    return rc.remaining = rc.delay = Math.ceil(rc.delay * 1.5);
  };

  tick = function() {
    if (rc.state === 'connecting') {
      return;
    }
    rc.remaining -= 1;
    if (rc.remaining === 0) {
      Offline.trigger('reconnect:connecting');
      rc.state = 'connecting';
      return Offline.check();
    } else {
      return Offline.trigger('reconnect:tick');
    }
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
    console.log('nope', rc.state);
    if (rc.state === 'connecting') {
      Offline.trigger('reconnect:failure');
      rc.state = 'waiting';
      console.log('next');
      return next();
    }
  };

  Offline.on('down', down);

  Offline.on('confirmed-down', nope);

  Offline.on('up', up);

}).call(this);
