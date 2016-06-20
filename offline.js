/*! offline-js 0.7.18 */
(function() {
  var Offline, checkXHR, defaultOptions, extendNative, grab, handlers, init;
  extendNative = function(to, from) {
    var e, key, results, val;
    results = [];
    for (key in from.prototype) try {
      val = from.prototype[key], null == to[key] && "function" != typeof val ? results.push(to[key] = val) :results.push(void 0);
    } catch (_error) {
      e = _error;
    }
    return results;
  }, Offline = {}, Offline.options = window.Offline ? window.Offline.options || {} :{}, 
  defaultOptions = {
    checks:{
      xhr:{
        url:function() {
          return "/favicon.ico?_=" + new Date().getTime();
        },
        timeout:5e3,
        type:"HEAD"
      },
      image:{
        url:function() {
          return "/favicon.ico?_=" + new Date().getTime();
        }
      },
      active:"xhr"
    },
    checkOnLoad:!1,
    interceptRequests:!0,
    reconnect:!0,
    deDupBody:!1,
    unauthorized:!1,
    signIn:"/",
    modal:!1
  }, grab = function(obj, key) {
    var cur, i, j, len, part, parts;
    for (cur = obj, parts = key.split("."), i = j = 0, len = parts.length; j < len && (part = parts[i], 
    cur = cur[part], "object" == typeof cur); i = ++j) ;
    return i === parts.length - 1 ? cur :void 0;
  }, Offline.getOption = function(key) {
    var ref, val;
    return val = null != (ref = grab(Offline.options, key)) ? ref :grab(defaultOptions, key), 
    "function" == typeof val ? val() :val;
  }, "function" == typeof window.addEventListener && window.addEventListener("online", function() {
    return setTimeout(Offline.confirmUp, 100);
  }, !1), "function" == typeof window.addEventListener && window.addEventListener("offline", function() {
    return Offline.confirmDown();
  }, !1), Offline.state = "up", Offline.markUp = function() {
    if (Offline.trigger("confirmed-up"), "up" !== Offline.state) return Offline.state = "up", 
    Offline.trigger("up");
  }, Offline.markDown = function() {
    if (Offline.trigger("confirmed-down"), "down" !== Offline.state) return Offline.state = "down", 
    Offline.trigger("down");
  }, Offline.markUnauthorized = function() {
    if (Offline.trigger("confirmed-unauthorized"), "unauthorized" !== Offline.state) return Offline.state = "unauthorized", 
    Offline.trigger("unauthorized");
  }, handlers = {}, Offline.on = function(event, handler, ctx) {
    var e, events, j, len, results;
    if (events = event.split(" "), events.length > 1) {
      for (results = [], j = 0, len = events.length; j < len; j++) e = events[j], results.push(Offline.on(e, handler, ctx));
      return results;
    }
    return null == handlers[event] && (handlers[event] = []), handlers[event].push([ ctx, handler ]);
  }, Offline.off = function(event, handler) {
    var _handler, ctx, i, ref, results;
    if (null != handlers[event]) {
      if (handler) {
        for (i = 0, results = []; i < handlers[event].length; ) ref = handlers[event][i], 
        ctx = ref[0], _handler = ref[1], _handler === handler ? results.push(handlers[event].splice(i, 1)) :results.push(i++);
        return results;
      }
      return handlers[event] = [];
    }
  }, Offline.trigger = function(event) {
    var ctx, handler, j, len, ref, ref1, results;
    if (null != handlers[event]) {
      for (ref = handlers[event].slice(0), results = [], j = 0, len = ref.length; j < len; j++) ref1 = ref[j], 
      ctx = ref1[0], handler = ref1[1], results.push(handler.call(ctx));
      return results;
    }
  }, checkXHR = function(xhr, onUp, onDown, onUnauthorized) {
    var _onerror, _onload, _onreadystatechange, _ontimeout, checkStatus;
    return checkStatus = function() {
      return xhr.status && xhr.status < 12e3 ? Offline.getOption("unauthorized") && 401 === xhr.status ? onUnauthorized() :onUp() :onDown();
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
    checkXHR(xhr, Offline.markUp, Offline.markDown, Offline.markUnauthorized);
    try {
      xhr.send();
    } catch (_error) {
      e = _error, Offline.markDown();
    }
    return xhr;
  }, Offline.checks.image = function() {
    var img;
    img = document.createElement("img"), img.onerror = Offline.markDown, img.onload = Offline.markUp, 
    img.src = Offline.getOption("checks.image.url");
  }, Offline.checks.down = Offline.markDown, Offline.checks.up = Offline.markUp, Offline.check = function() {
    return Offline.trigger("checking"), Offline.checks[Offline.getOption("checks.active")]();
  }, Offline.confirmUp = Offline.confirmDown = Offline.confirmUnauthorized = Offline.check, 
  Offline.onXHR = function(cb) {
    var _XDomainRequest, _XMLHttpRequest, monitorXHR;
    if (monitorXHR = function(req, flags) {
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
      var _overrideMimeType, _setRequestHeader, req;
      return req = new _XMLHttpRequest(flags), monitorXHR(req, flags), _setRequestHeader = req.setRequestHeader, 
      req.headers = {}, req.setRequestHeader = function(name, value) {
        return req.headers[name] = value, _setRequestHeader.call(req, name, value);
      }, _overrideMimeType = req.overrideMimeType, req.overrideMimeType = function(type) {
        return req.mimeType = type, _overrideMimeType.call(req, type);
      }, req;
    }, extendNative(window.XMLHttpRequest, _XMLHttpRequest), null != window.XDomainRequest) return _XDomainRequest = window.XDomainRequest, 
    window.XDomainRequest = function() {
      var req;
      return req = new _XDomainRequest(), monitorXHR(req), req;
    }, extendNative(window.XDomainRequest, _XDomainRequest);
  }, init = function() {
    if (Offline.getOption("interceptRequests") && Offline.onXHR(function(arg) {
      var xhr;
      if (xhr = arg.xhr, xhr.offline !== !1) return checkXHR(xhr, Offline.markUp, Offline.confirmDown, Offline.confirmUnauthorized);
    }), Offline.getOption("checkOnLoad")) return Offline.check();
  }, setTimeout(init, 0), window.Offline = Offline;
}).call(this), function() {
  var next, nope, rc, reconnect, reset, retryIntv, tick, tryNow, up;
  if (!window.Offline) throw new Error("Offline Reconnect brought in without offline.js");
  rc = Offline.reconnect = {}, retryIntv = null, reset = function() {
    var ref;
    return null != rc.state && "inactive" !== rc.state && Offline.trigger("reconnect:stopped"), 
    rc.state = "inactive", rc.remaining = rc.delay = null != (ref = Offline.getOption("reconnect.initialDelay")) ? ref :3;
  }, next = function() {
    var delay, ref;
    return delay = null != (ref = Offline.getOption("reconnect.delay")) ? ref :Math.min(Math.ceil(1.5 * rc.delay), 3600), 
    rc.remaining = rc.delay = delay;
  }, tick = function() {
    if ("connecting" !== rc.state) return rc.remaining -= 1, Offline.trigger("reconnect:tick"), 
    0 === rc.remaining ? tryNow() :void 0;
  }, tryNow = function() {
    if ("waiting" === rc.state) return Offline.trigger("reconnect:connecting"), rc.state = "connecting", 
    Offline.check();
  }, reconnect = function() {
    if (Offline.getOption("reconnect")) return reset(), rc.state = "waiting", Offline.trigger("reconnect:started"), 
    retryIntv = setInterval(tick, 1e3);
  }, up = function() {
    return null != retryIntv && clearInterval(retryIntv), reset();
  }, nope = function() {
    if (Offline.getOption("reconnect")) return "connecting" === rc.state ? (Offline.trigger("reconnect:failure"), 
    rc.state = "waiting", next()) :void 0;
  }, rc.tryNow = tryNow, reset(), Offline.on("down", reconnect), Offline.on("unauthorized", reconnect), 
  Offline.on("confirmed-down", nope), Offline.on("confirmed-unauthorized", nope), 
  Offline.on("up", up);
}.call(this), function() {
  var clear, flush, held, holdRequest, makeRequest, waitingOnConfirm;
  if (!window.Offline) throw new Error("Requests module brought in without offline.js");
  held = [], waitingOnConfirm = !1, holdRequest = function(req) {
    if (Offline.getOption("requests") !== !1) return Offline.trigger("requests:capture"), 
    "down" !== Offline.state && (waitingOnConfirm = !0), held.push(req);
  }, makeRequest = function(arg) {
    var body, name, password, ref, type, url, user, val, xhr;
    if (xhr = arg.xhr, url = arg.url, type = arg.type, user = arg.user, password = arg.password, 
    body = arg.body, Offline.getOption("requests") !== !1) {
      xhr.abort(), xhr.open(type, url, !0, user, password), ref = xhr.headers;
      for (name in ref) val = ref[name], xhr.setRequestHeader(name, val);
      return xhr.mimeType && xhr.overrideMimeType(xhr.mimeType), xhr.send(body);
    }
  }, clear = function() {
    return held = [];
  }, flush = function() {
    var body, i, key, len, request, requests, url;
    if (Offline.getOption("requests") !== !1) {
      for (Offline.trigger("requests:flush"), requests = {}, i = 0, len = held.length; i < len; i++) request = held[i], 
      url = request.url.replace(/(\?|&)_=[0-9]+/, function(match, chr) {
        return "?" === chr ? chr :"";
      }), Offline.getOption("deDupBody") ? (body = request.body, body = "[object Object]" === body.toString() ? JSON.stringify(body) :body.toString(), 
      requests[request.type.toUpperCase() + " - " + url + " - " + body] = request) :requests[request.type.toUpperCase() + " - " + url] = request;
      for (key in requests) request = requests[key], makeRequest(request);
      return clear();
    }
  }, setTimeout(function() {
    if (Offline.getOption("requests") !== !1) return Offline.on("confirmed-up", function() {
      if (waitingOnConfirm) return waitingOnConfirm = !1, clear();
    }), Offline.on("up", flush), Offline.on("down", function() {
      return waitingOnConfirm = !1;
    }), Offline.on("unauthorized", function() {
      return waitingOnConfirm = !1;
    }), Offline.onXHR(function(request) {
      var _onreadystatechange, _send, async, hold, xhr;
      if (xhr = request.xhr, async = request.async, xhr.offline !== !1 && (hold = function() {
        return holdRequest(request);
      }, _send = xhr.send, xhr.send = function(body) {
        return request.body = body, _send.apply(xhr, arguments);
      }, async)) return null === xhr.onprogress ? (xhr.addEventListener("error", hold, !1), 
      xhr.addEventListener("timeout", hold, !1)) :(_onreadystatechange = xhr.onreadystatechange, 
      xhr.onreadystatechange = function() {
        return 0 === xhr.readyState ? hold() :4 === xhr.readyState && (0 === xhr.status || xhr.status >= 12e3) && hold(), 
        "function" == typeof _onreadystatechange ? _onreadystatechange.apply(null, arguments) :void 0;
      });
    }), Offline.requests = {
      flush:flush,
      clear:clear
    };
  }, 0);
}.call(this), function() {
  var base, e, i, len, ref, simulate, state;
  if (!Offline) throw new Error("Offline simulate brought in without offline.js");
  for (ref = [ "up", "down" ], i = 0, len = ref.length; i < len; i++) {
    state = ref[i];
    try {
      simulate = document.querySelector("script[data-simulate='" + state + "']") || ("undefined" != typeof localStorage && null !== localStorage ? localStorage.OFFLINE_SIMULATE :void 0) === state;
    } catch (_error) {
      e = _error, simulate = !1;
    }
  }
  simulate && (null == Offline.options && (Offline.options = {}), null == (base = Offline.options).checks && (base.checks = {}), 
  Offline.options.checks.active = state);
}.call(this), function() {
  var MODAL_TEMPLATE, RETRY_TEMPLATE, SIGN_IN_TEMPLATE, TEMPLATE, _onreadystatechange, addClass, content, createFromHTML, el, flashClass, flashTimeouts, init, modal, removeClass, render, roundTime;
  if (!window.Offline) throw new Error("Offline UI brought in without offline.js");
  TEMPLATE = '<div class="offline-ui"><div class="offline-ui-content"></div></div>', 
  RETRY_TEMPLATE = '<a href class="offline-ui-retry"></a>', SIGN_IN_TEMPLATE = '<a href class="offline-ui-sign-in"></a>', 
  MODAL_TEMPLATE = '<div class="offline-modal">', createFromHTML = function(html) {
    var el;
    return el = document.createElement("div"), el.innerHTML = html, el.children[0];
  }, el = content = modal = null, addClass = function(name) {
    if (removeClass(name), el.className += " " + name, modal) return modal.className += " " + name;
  }, removeClass = function(name) {
    if (el.className = el.className.replace(new RegExp("(^| )" + name.split(" ").join("|") + "( |$)", "gi"), " ").split(/\s+/).join(" "), 
    modal) return modal.className = modal.className.replace(new RegExp("(^| )" + name.split(" ").join("|") + "( |$)", "gi"), " ").split(/\s+/).join(" ");
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
    Offline.getOption("signIn") && (el.appendChild(createFromHTML(SIGN_IN_TEMPLATE)), 
    button = el.querySelector(".offline-ui-sign-in"), button.href = Offline.getOption("signIn")), 
    Offline.getOption("modal") && (modal = createFromHTML(MODAL_TEMPLATE), document.body.appendChild(modal)), 
    addClass("offline-ui-" + Offline.state), content = el.querySelector(".offline-ui-content");
  }, init = function() {
    return render(), Offline.on("up", function() {
      return removeClass("offline-ui-down"), removeClass("offline-ui-unauthorized"), addClass("offline-ui-up"), 
      flashClass("offline-ui-up-2s", 2), flashClass("offline-ui-up-5s", 5);
    }), Offline.on("down", function() {
      return removeClass("offline-ui-up"), removeClass("offline-ui-unauthorized"), addClass("offline-ui-down"), 
      flashClass("offline-ui-down-2s", 2), flashClass("offline-ui-down-5s", 5);
    }), Offline.on("unauthorized", function() {
      return removeClass("offline-ui-up"), removeClass("offline-ui-down"), addClass("offline-ui-unauthorized"), 
      flashClass("offline-ui-unauthorized-2s", 2), flashClass("offline-ui-unauthorized-5s", 5);
    }), Offline.on("reconnect:connecting", function() {
      return addClass("offline-ui-connecting"), removeClass("offline-ui-waiting");
    }), Offline.on("reconnect:tick", function() {
      var ref, time, unit;
      return addClass("offline-ui-waiting"), removeClass("offline-ui-connecting"), ref = roundTime(Offline.reconnect.remaining), 
      time = ref[0], unit = ref[1], content.setAttribute("data-retry-in-value", time), 
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