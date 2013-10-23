(function() {
  var clear, flush, held, holdRequest, makeRequest, waitingOnConfirm;

  if (!window.Offline) {
    throw new Error("Pegasus brought in without offline.js");
  }

  held = [];

  waitingOnConfirm = false;

  holdRequest = function(req) {
    console.log('holding', req);
    if (Offline.state !== 'down') {
      waitingOnConfirm = true;
    }
    return held.push(req);
  };

  makeRequest = function(_arg) {
    var xhr;
    xhr = _arg.xhr;
    console.log('remaking', xhr);
    xhr.abort();
    return xhr.send();
  };

  clear = function() {
    console.log('clearing');
    return held = [];
  };

  flush = function() {
    var key, request, requests, url, _i, _len;
    requests = {};
    console.log('flush');
    for (_i = 0, _len = held.length; _i < _len; _i++) {
      request = held[_i];
      url = request.url.replace(/(\?|&)_=[0-9]+/, function(match, char) {
        if (char === '?') {
          return char;
        } else {
          return '';
        }
      });
      requests["" + (request.type.toUpperCase()) + " - " + url] = request;
    }
    for (key in requests) {
      request = requests[key];
      makeRequest(request);
    }
    return clear();
  };

  Offline.on('confirmed-up', function() {
    if (waitingOnConfirm) {
      waitingOnConfirm = false;
      return clear();
    }
  });

  Offline.on('up', flush);

  Offline.on('down', function() {
    return waitingOnConfirm = false;
  });

  Offline.onXHR(function(request) {
    var async, hold, xhr, _onreadystatechange;
    xhr = request.xhr, async = request.async;
    hold = function() {
      return holdRequest;
    };
    if (!async) {
      return;
    }
    if (xhr.onprogress === null) {
      xhr.addEventListener('error', hold, false);
      return xhr.addEventListener('timeout', hold, false);
    } else {
      _onreadystatechange = xhr.onreadystatechange;
      return xhr.onreadystatechange = function() {
        if (xhr.readyState === 0) {
          hold();
        } else if (xhr.readyState === 4 && (xhr.status === 0 || xhr.status >= 12000)) {
          hold();
        }
        return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
      };
    }
  });

  Offline.requests = {
    flush: flush,
    clear: clear
  };

}).call(this);
