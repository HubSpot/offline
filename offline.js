(function() {
  var Offline, checkXHR, defaultOptions, extendNative, handlers, init, onXHR;

  extendNative = function(to, from) {
    var e, key, val, _results;
    _results = [];
    for (key in from.prototype) {
      try {
        val = from.prototype[key];
        if ((to[key] == null) && typeof val !== 'function') {
          _results.push(to[key] = val);
        } else {
          _results.push(void 0);
        }
      } catch (_error) {
        e = _error;
      }
    }
    return _results;
  };

  Offline = {};

  if (Offline.options == null) {
    Offline.options = {};
  }

  defaultOptions = {
    checkURL: function() {
      return "/offline-test-request/" + (Math.floor(Math.random() * 1000000000));
    },
    checkOnLoad: false,
    interceptRequests: true
  };

  Offline.getOption = function(key) {
    var val, _ref;
    val = (_ref = Offline.options[key]) != null ? _ref : defaultOptions[key];
    if (typeof val === 'function') {
      return val();
    } else {
      return val;
    }
  };

  if (typeof window.addEventListener === "function") {
    window.addEventListener('online', function() {
      return Offline.confirmUp();
    }, false);
  }

  if (typeof window.addEventListener === "function") {
    window.addEventListener('offline', function() {
      return Offline.confirmDown();
    }, false);
  }

  Offline.state = 'up';

  Offline.markUp = function() {
    if (Offline.state === 'up') {
      return;
    }
    Offline.state = 'up';
    return Offline.trigger('up');
  };

  Offline.markDown = function() {
    if (Offline.state === 'down') {
      return;
    }
    Offline.state = 'down';
    return Offline.trigger('down');
  };

  handlers = {
    up: [],
    down: []
  };

  Offline.on = function(event, handler, ctx) {
    return handlers[event].push([ctx, handler]);
  };

  Offline.off = function(event, handler) {
    var ctx, i, _handler, _ref, _results;
    if (!handler) {
      return handlers[event] = [];
    } else {
      i = 0;
      _results = [];
      while (i < handlers.length) {
        _ref = handlers[i], ctx = _ref[0], _handler = _ref[1];
        if (_handler === handler) {
          _results.push(handlers.splice(i--, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  Offline.trigger = function(event) {
    var ctx, handler, _i, _len, _ref, _ref1, _results;
    _ref = handlers[event];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], ctx = _ref1[0], handler = _ref1[1];
      _results.push(handler.call(ctx));
    }
    return _results;
  };

  checkXHR = function(xhr, onUp, onDown) {
    var checkStatus;
    checkStatus = function() {
      if (xhr.status) {
        return onUp();
      } else {
        return onDown();
      }
    };
    if (xhr.onprogress === null) {
      xhr.onerror = xhr.ontimeout = onDown;
      return xhr.onload = checkStatus;
    } else {
      return xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          return checkStatus();
        } else if (xhr.readyState === 0) {
          return onDown();
        }
      };
    }
  };

  Offline.check = function() {
    var xhr,
      _this = this;
    xhr = new XMLHttpRequest;
    xhr.open('GET', Offline.getOption('checkURL'), true);
    checkXHR(xhr, (function() {
      return Offline.markUp;
    }), (function() {
      return Offline.markDown;
    }));
    return xhr.send();
  };

  Offline.confirmUp = Offline.confirmDown = Offline.check;

  onXHR = function(cb) {
    var monitorXHR, _XDomainRequest, _XMLHttpRequest,
      _this = this;
    monitorXHR = function(req) {
      var _open;
      _open = req.open;
      return req.open = function(type, url, async) {
        cb({
          type: type,
          url: url,
          request: req
        });
        return _open.apply(req, arguments);
      };
    };
    _XMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = function(flags) {
      var req;
      req = new _XMLHttpRequest(flags);
      monitorXHR(req);
      return req;
    };
    extendNative(window.XMLHttpRequest, _XMLHttpRequest);
    if (window.XDomainRequest != null) {
      _XDomainRequest = window.XDomainRequest;
      window.XDomainRequest = function() {
        var req;
        req = new _XDomainRequest;
        monitorXHR(req);
        return req;
      };
      return extendNative(window.XDomainRequest, _XDomainRequest);
    }
  };

  init = function() {
    if (Offline.getOption('interceptRequests')) {
      onXHR(function(_arg) {
        var request,
          _this = this;
        request = _arg.request;
        return checkXHR(request, (function() {
          return Offline.confirmUp;
        }), (function() {
          return Offline.confirmDown;
        }));
      });
    }
    if (Offline.getOption('checkOnLoad')) {
      return Offline.check();
    }
  };

  setTimeout(init, 0);

  window.Offline = Offline;

}).call(this);
