unless Offline
  throw new Error("Offline simulate brought in without offline.js")

for state in ['up', 'down']
  if document.querySelector("script[data-simulate='#{ state }']") or localStorage.OFFLINE_SIMULATE is state
    Offline.options ?= {}
    Offline.options.checks ?= {}
    Offline.options.checks.active = state
