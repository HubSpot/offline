unless Offline
  throw new Error("Offline simulate brought in without offline.js")

if document.querySelector('script[data-simulate="down"]') or localStorage.OFFLINE_FORCE_DOWN
  Offline.options.checks.active = 'down'
else if document.querySelector('script[data-simulate="up"]') or localStorage.OFFLINE_FORCE_UP
  Offline.options.checks.active = 'up'
