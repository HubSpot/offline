(function() {
  var state, _base, _i, _len, _ref;

  if (!Offline) {
    throw new Error("Offline simulate brought in without offline.js");
  }

  _ref = ['up', 'down'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    state = _ref[_i];
    if (document.querySelector("script[data-simulate='" + state + "']") || localStorage.OFFLINE_SIMULATE === state) {
      if (Offline.options == null) {
        Offline.options = {};
      }
      if ((_base = Offline.options).checks == null) {
        _base.checks = {};
      }
      Offline.options.checks.active = state;
    }
  }

}).call(this);
