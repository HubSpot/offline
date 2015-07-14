/*! offline-js 0.7.13 */
(function() {
  var Offline, checkXHR, defaultOptions, extendNative, grab, handlers, init;
  extendNative = function(to, from) {
    var e, key, val, _results;
    _results = [];
    for (key in from.prototype) try {
      val = from.prototype[key], null == to[key] && "function" != typeof val ? _results.push(to[key] = val) :_results.push(void 0);
    } catch (_error) {
      e = _error;
    }
    return _results;
  }, Offline = {}, null == Offline.options && (Offline.options = {}), defaultOptions = {
    checks:{
      xhr:{
        url:function() {
          return "/favicon.ico?_=" + Math.floor(1e9 * Math.random());
        },
        timeout:5e3,
        type:"HEAD"
      },
      image:{
        url:function() {
          return "/favicon.ico?_=" + Math.floor(1e9 * Math.random());
        }
      },
      active:"xhr"
    },
    checkOnLoad:!1,
    interceptRequests:!0,
    reconnect:!0
  }, grab = function(obj, key) {
    var cur, i, part, parts, _i, _len;
    for (cur = obj, parts = key.split("."), i = _i = 0, _len = parts.length; _len > _i && (part = parts[i], 
    cur = cur[part], "object" == typeof cur); i = ++_i) ;
    return i === parts.length - 1 ? cur :void 0;
  }, Offline.getOption = function(key) {
    var val, _ref;
    return val = null != (_ref = grab(Offline.options, key)) ? _ref :grab(defaultOptions, key), 
    "function" == typeof val ? val() :val;
  }, "function" == typeof window.addEventListener && window.addEventListener("online", function() {
    return setTimeout(Offline.confirmUp, 100);
  }, !1), "function" == typeof window.addEventListener && window.addEventListener("offline", function() {
    return Offline.confirmDown();
  }, !1), Offline.state = "up", Offline.markUp = function() {
    return Offline.trigger("confirmed-up"), "up" !== Offline.state ? (Offline.state = "up", 
    Offline.trigger("up")) :void 0;
  }, Offline.markDown = function() {
    return Offline.trigger("confirmed-down"), "down" !== Offline.state ? (Offline.state = "down", 
    Offline.trigger("down")) :void 0;
  }, handlers = {}, Offline.on = function(event, handler, ctx) {
    var e, events, _i, _len, _results;
    if (events = event.split(" "), events.length > 1) {
      for (_results = [], _i = 0, _len = events.length; _len > _i; _i++) e = events[_i], 
      _results.push(Offline.on(e, handler, ctx));
      return _results;
    }
    return null == handlers[event] && (handlers[event] = []), handlers[event].push([ ctx, handler ]);
  }, Offline.off = function(event, handler) {
    var ctx, i, _handler, _ref, _results;
    if (null != handlers[event]) {
      if (handler) {
        for (i = 0, _results = []; i < handlers[event].length; ) _ref = handlers[event][i], 
        ctx = _ref[0], _handler = _ref[1], _handler === handler ? _results.push(handlers[event].splice(i, 1)) :_results.push(i++);
        return _results;
      }
      return handlers[event] = [];
    }
  }, Offline.trigger = function(event) {
    var ctx, handler, _i, _len, _ref, _ref1, _results;
    if (null != handlers[event]) {
      for (_ref = handlers[event], _results = [], _i = 0, _len = _ref.length; _len > _i; _i++) _ref1 = _ref[_i], 
      ctx = _ref1[0], handler = _ref1[1], _results.push(handler.call(ctx));
      return _results;
    }
  }, checkXHR = function(xhr, onUp, onDown) {
    var checkStatus, _onerror, _onload, _onreadystatechange, _ontimeout;
    return checkStatus = function() {
      return xhr.status && xhr.status < 12e3 ? onUp() :onDown();
    }, null === xhr.onprogress ? (_onerror = xhr.onerror, xhr.onerror = function() {
      return onDown(), "function" == typeof _onerror ? _onerror.apply(null, arguments) :void 0;
    }, _ontimeout = xhr.ontimeout, xhr.ontimeout = function() {
      return onDown(), "function" == typeof _ontimeout ? _ontimeout.apply(null, arguments) :void 0;
    }, _onload = xhr.onload, xhr.onload = function() {
      return checkStatus(), "function" == typeof _onload ? _onload.apply(null, arguments) :void 0;
    }) :(_onreadystatechange = xhr.onreadystatechange, xhr.onreadystatechange = function() {
      return 4 === xhr.readyState ? checkStatus() :0 === xhr.readyState && onDown(), "function" == typeof _onreadystatechange ? _onreadystatechange.apply(null, arguments) :void 0;
    });
  }, Offline.checks = {}, Offline.checks.xhr = function() {
    var e, xhr;
    xhr = new XMLHttpRequest(), xhr.offline = !1, xhr.open(Offline.getOption("checks.xhr.type"), Offline.getOption("checks.xhr.url"), !0), 
    null != xhr.timeout && (xhr.timeout = Offline.getOption("checks.xhr.timeout")), 
    checkXHR(xhr, Offline.markUp, Offline.markDown);
    try {
      xhr.send();
    } catch (_error) {
      e = _error, Offline.markDown();
    }
    return xhr;
  }, Offline.checks.image = function() {
    var img;
    return img = document.createElement("img"), img.onerror = Offline.markDown, img.onload = Offline.markUp, 
    void (img.src = Offline.getOption("checks.image.url"));
  }, Offline.checks.down = Offline.markDown, Offline.checks.up = Offline.markUp, Offline.check = function() {
    return Offline.trigger("checking"), Offline.checks[Offline.getOption("checks.active")]();
  }, Offline.confirmUp = Offline.confirmDown = Offline.check, Offline.onXHR = function(cb) {
    var monitorXHR, _XDomainRequest, _XMLHttpRequest;
    return monitorXHR = function(req, flags) {
      var _open;
      return _open = req.open, req.open = function(type, url, async, user, password) {
        return cb({
          type:type,
          url:url,
          async:async,
          flags:flags,
          user:user,
          password:password,
          xhr:req
        }), _open.apply(req, arguments);
      };
    }, _XMLHttpRequest = window.XMLHttpRequest, window.XMLHttpRequest = function(flags) {
      var req, _overrideMimeType, _setRequestHeader;
      return req = new _XMLHttpRequest(flags), monitorXHR(req, flags), _setRequestHeader = req.setRequestHeader, 
      req.headers = {}, req.setRequestHeader = function(name, value) {
        return req.headers[name] = value, _setRequestHeader.call(req, name, value);
      }, _overrideMimeType = req.overrideMimeType, req.overrideMimeType = function(type) {
        return req.mimeType = type, _overrideMimeType.call(req, type);
      }, req;
    }, extendNative(window.XMLHttpRequest, _XMLHttpRequest), null != window.XDomainRequest ? (_XDomainRequest = window.XDomainRequest, 
    window.XDomainRequest = function() {
      var req;
      return req = new _XDomainRequest(), monitorXHR(req), req;
    }, extendNative(window.XDomainRequest, _XDomainRequest)) :void 0;
  }, init = function() {
    return Offline.getOption("interceptRequests") && Offline.onXHR(function(_arg) {
      var xhr;
      return xhr = _arg.xhr, xhr.offline !== !1 ? checkXHR(xhr, Offline.markUp, Offline.confirmDown) :void 0;
    }), Offline.getOption("checkOnLoad") ? Offline.check() :void 0;
  }, setTimeout(init, 0), window.Offline = Offline;
}).call(this), function() {
  var down, next, nope, rc, reset, retryIntv, tick, tryNow, up;
  if (!window.Offline) throw new Error("Offline Reconnect brought in without offline.js");
  rc = Offline.reconnect = {}, retryIntv = null, reset = function() {
    var _ref;
    return null != rc.state && "inactive" !== rc.state && Offline.trigger("reconnect:stopped"), 
    rc.state = "inactive", rc.remaining = rc.delay = null != (_ref = Offline.getOption("reconnect.initialDelay")) ? _ref :3;
  }, next = function() {
    var delay, _ref;
    return delay = null != (_ref = Offline.getOption("reconnect.delay")) ? _ref :Math.min(Math.ceil(1.5 * rc.delay), 3600), 
    rc.remaining = rc.delay = delay;
  }, tick = function() {
    return "connecting" !== rc.state ? (rc.remaining -= 1, Offline.trigger("reconnect:tick"), 
    0 === rc.remaining ? tryNow() :void 0) :void 0;
  }, tryNow = function() {
    return "waiting" === rc.state ? (Offline.trigger("reconnect:connecting"), rc.state = "connecting", 
    Offline.check()) :void 0;
  }, down = function() {
    return Offline.getOption("reconnect") ? (reset(), rc.state = "waiting", Offline.trigger("reconnect:started"), 
    retryIntv = setInterval(tick, 1e3)) :void 0;
  }, up = function() {
    return null != retryIntv && clearInterval(retryIntv), reset();
  }, nope = function() {
    return Offline.getOption("reconnect") && "connecting" === rc.state ? (Offline.trigger("reconnect:failure"), 
    rc.state = "waiting", next()) :void 0;
  }, rc.tryNow = tryNow, reset(), Offline.on("down", down), Offline.on("confirmed-down", nope), 
  Offline.on("up", up);
}.call(this), function() {
  var clear, flush, held, holdRequest, makeRequest, waitingOnConfirm;
  if (!window.Offline) throw new Error("Requests module brought in without offline.js");
  held = [], waitingOnConfirm = !1, holdRequest = function(req) {
    return Offline.trigger("requests:capture"), "down" !== Offline.state && (waitingOnConfirm = !0), 
    held.push(req);
  }, makeRequest = function(_arg) {
    var body, name, password, type, url, user, val, xhr, _ref;
    xhr = _arg.xhr, url = _arg.url, type = _arg.type, user = _arg.user, password = _arg.password, 
    body = _arg.body, xhr.abort(), xhr.open(type, url, !0, user, password), _ref = xhr.headers;
    for (name in _ref) val = _ref[name], xhr.setRequestHeader(name, val);
    return xhr.mimeType && xhr.overrideMimeType(xhr.mimeType), xhr.send(body);
  }, clear = function() {
    return held = [];
  }, flush = function() {
    var key, request, requests, url, _i, _len;
    for (Offline.trigger("requests:flush"), requests = {}, _i = 0, _len = held.length; _len > _i; _i++) request = held[_i], 
    url = request.url.replace(/(\?|&)_=[0-9]+/, function(match, char) {
      return "?" === char ? char :"";
    }), requests["" + request.type.toUpperCase() + " - " + url] = request;
    for (key in requests) request = requests[key], makeRequest(request);
    return clear();
  }, setTimeout(function() {
    return Offline.getOption("requests") !== !1 ? (Offline.on("confirmed-up", function() {
      return waitingOnConfirm ? (waitingOnConfirm = !1, clear()) :void 0;
    }), Offline.on("up", flush), Offline.on("down", function() {
      return waitingOnConfirm = !1;
    }), Offline.onXHR(function(request) {
      var async, hold, xhr, _onreadystatechange, _send;
      return xhr = request.xhr, async = request.async, xhr.offline !== !1 && (hold = function() {
        return holdRequest(request);
      }, _send = xhr.send, xhr.send = function(body) {
        return request.body = body, _send.apply(xhr, arguments);
      }, async) ? null === xhr.onprogress ? (xhr.addEventListener("error", hold, !1), 
      xhr.addEventListener("timeout", hold, !1)) :(_onreadystatechange = xhr.onreadystatechange, 
      xhr.onreadystatechange = function() {
        return 0 === xhr.readyState ? hold() :4 === xhr.readyState && (0 === xhr.status || xhr.status >= 12e3) && hold(), 
        "function" == typeof _onreadystatechange ? _onreadystatechange.apply(null, arguments) :void 0;
      }) :void 0;
    }), Offline.requests = {
      flush:flush,
      clear:clear
    }) :void 0;
  }, 0);
}.call(this), function() {
  var state, _base, _i, _len, _ref;
  if (!Offline) throw new Error("Offline simulate brought in without offline.js");
  for (_ref = [ "up", "down" ], _i = 0, _len = _ref.length; _len > _i; _i++) state = _ref[_i], 
  (document.querySelector("script[data-simulate='" + state + "']") || ("undefined" != typeof localStorage && null !== localStorage ? localStorage.OFFLINE_SIMULATE :void 0) === state) && (null == Offline.options && (Offline.options = {}), 
  null == (_base = Offline.options).checks && (_base.checks = {}), Offline.options.checks.active = state);
}.call(this), function() {
  var RETRY_TEMPLATE, TEMPLATE, addClass, content, createFromHTML, el, flashClass, flashTimeouts, init, removeClass, render, roundTime, _onreadystatechange;
  if (!window.Offline) throw new Error("Offline UI brought in without offline.js");
  TEMPLATE = '<div class="offline-ui"><div class="offline-ui-content"></div></div>', 
  RETRY_TEMPLATE = '<a href class="offline-ui-retry"></a>', createFromHTML = function(html) {
    var el;
    return el = document.createElement("div"), el.innerHTML = html, el.children[0];
  }, el = content = null, addClass = function(name) {
    return removeClass(name), el.className += " " + name;
  }, removeClass = function(name) {
    return el.className = el.className.replace(new RegExp("(^| )" + name.split(" ").join("|") + "( |$)", "gi"), " ");
  }, flashTimeouts = {}, flashClass = function(name, time) {
    return addClass(name), null != flashTimeouts[name] && clearTimeout(flashTimeouts[name]), 
    flashTimeouts[name] = setTimeout(function() {
      return removeClass(name), delete flashTimeouts[name];
    }, 1e3 * time);
  }, roundTime = function(sec) {
    var mult, unit, units, val;
    units = {
      day:86400,
      hour:3600,
      minute:60,
      second:1
    };
    for (unit in units) if (mult = units[unit], sec >= mult) return val = Math.floor(sec / mult), 
    [ val, unit ];
    return [ "now", "" ];
  }, render = function() {
    var button, handler;
    return el = createFromHTML(TEMPLATE), document.body.appendChild(el), null != Offline.reconnect && Offline.getOption("reconnect") && (el.appendChild(createFromHTML(RETRY_TEMPLATE)), 
    button = el.querySelector(".offline-ui-retry"), handler = function(e) {
      return e.preventDefault(), Offline.reconnect.tryNow();
    }, null != button.addEventListener ? button.addEventListener("click", handler, !1) :button.attachEvent("click", handler)), 
    addClass("offline-ui-" + Offline.state), content = el.querySelector(".offline-ui-content");
  }, init = function() {
    return render(), Offline.on("up", function() {
      return removeClass("offline-ui-down"), addClass("offline-ui-up"), flashClass("offline-ui-up-2s", 2), 
      flashClass("offline-ui-up-5s", 5);
    }), Offline.on("down", function() {
      return removeClass("offline-ui-up"), addClass("offline-ui-down"), flashClass("offline-ui-down-2s", 2), 
      flashClass("offline-ui-down-5s", 5);
    }), Offline.on("reconnect:connecting", function() {
      return addClass("offline-ui-connecting"), removeClass("offline-ui-waiting");
    }), Offline.on("reconnect:tick", function() {
      var time, unit, _ref;
      return addClass("offline-ui-waiting"), removeClass("offline-ui-connecting"), _ref = roundTime(Offline.reconnect.remaining), 
      time = _ref[0], unit = _ref[1], content.setAttribute("data-retry-in-value", time), 
      content.setAttribute("data-retry-in-unit", unit);
    }), Offline.on("reconnect:stopped", function() {
      return removeClass("offline-ui-connecting offline-ui-waiting"), content.setAttribute("data-retry-in-value", null), 
      content.setAttribute("data-retry-in-unit", null);
    }), Offline.on("reconnect:failure", function() {
      return flashClass("offline-ui-reconnect-failed-2s", 2), flashClass("offline-ui-reconnect-failed-5s", 5);
    }), Offline.on("reconnect:success", function() {
      return flashClass("offline-ui-reconnect-succeeded-2s", 2), flashClass("offline-ui-reconnect-succeeded-5s", 5);
    });
  }, "complete" === document.readyState ? init() :null != document.addEventListener ? document.addEventListener("DOMContentLoaded", init, !1) :(_onreadystatechange = document.onreadystatechange, 
  document.onreadystatechange = function() {
    return "complete" === document.readyState && init(), "function" == typeof _onreadystatechange ? _onreadystatechange.apply(null, arguments) :void 0;
  });
}.call(this);