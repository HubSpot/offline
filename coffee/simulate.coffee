unless Offline
  throw new Error("Offline simulate brought in without offline.js")

for state in ['up', 'down']
    try
      simulate = document.querySelector("script[data-simulate='#{ state }']") or localStorage?.OFFLINE_SIMULATE is state
    catch e
      simulate = false

  if simulate
    Offline.options ?= {}
    Offline.options.checks ?= {}
    Offline.options.checks.active = state
