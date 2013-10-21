# We get a clue that the browser might be offline from suspicious requests or
# the HTML5 offline api.  If we suspect it's offline, we make a request for any random path
# which (probably) doesn't exist.  If we get a response, we're still online, if not,
# we trigger an event and update our status.

extendNative = (to, from) ->
  for key of from::
    try
      val = from::[key]

      if not to[key]? and typeof val isnt 'function'
        to[key] = val
    catch e

Offline = {}

Offline.options ?= {}
defaultOptions =
  checkURL: ->
    "/offline-test-request/#{ Math.floor(Math.random() * 1000000000) }"

  checkOnLoad: false

  interceptRequests: true

Offline.getOption = (key) ->
  val = Offline.options[key] ? defaultOptions[key]

  if typeof val is 'function'
    val()
  else
    val

# These events are available in modern browsers, but they mean different things.
# In FF and IE they mean the user has explicitly entered "Offline Mode"
# In Chrome they mean that the internet connection was lost or restored
window.addEventListener? 'online', ->
  Offline.confirmUp()
, false

window.addEventListener? 'offline', ->
  Offline.confirmDown()
, false

Offline.state = 'up'

Offline.markUp = ->
  return if Offline.state is 'up'

  Offline.state = 'up'
  Offline.trigger 'up'

Offline.markDown = ->
  return if Offline.state is 'down'

  Offline.state = 'down'
  Offline.trigger 'down'

handlers = {up: [], down: []}

Offline.on = (event, handler, ctx) ->
  handlers[event].push [ctx, handler]

Offline.off = (event, handler) ->
  if not handler
    handlers[event] = []
  else
    i = 0
    while i < handlers.length
      [ctx, _handler] = handlers[i]
      if _handler is handler
        handlers.splice i--, 1

Offline.trigger = (event) ->
  for [ctx, handler] in handlers[event]
    handler.call(ctx)

checkXHR = (xhr, onUp, onDown) ->
  checkStatus = ->
    if xhr.status
      onUp()
    else
      onDown()

  if xhr.onprogress is null
    # It would be undefined on older browsers
    xhr.onerror = xhr.ontimeout = onDown
    xhr.onload = checkStatus
  else
    xhr.onreadystatechange = ->
      if xhr.readyState is 4
        checkStatus()
      else if xhr.readyState is 0
        onDown()

Offline.check = ->
  xhr = new XMLHttpRequest

  # It doesn't matter what this hits, even a 404 is considered up.  It is important however that
  # it's on the same domain and port, so CORS issues don't come into play.
  xhr.open('GET', Offline.getOption('checkURL'), true)

  checkXHR xhr, (=> Offline.markUp), (=> Offline.markDown)

  xhr.send()

Offline.confirmUp = Offline.confirmDown = Offline.check

onXHR = (cb) ->
  monitorXHR = (req) =>
    _open = req.open
    req.open = (type, url, async) =>
      cb {type, url, request: req}

      _open.apply req, arguments

  _XMLHttpRequest = window.XMLHttpRequest
  window.XMLHttpRequest = (flags) ->
    req = new _XMLHttpRequest(flags)

    monitorXHR req

    req

  extendNative window.XMLHttpRequest, _XMLHttpRequest

  if window.XDomainRequest?
    _XDomainRequest = window.XDomainRequest
    window.XDomainRequest = ->
      req = new _XDomainRequest

      monitorXHR req

      req

    extendNative window.XDomainRequest, _XDomainRequest

init = ->
  if Offline.getOption 'interceptRequests'
    onXHR ({request}) ->
      checkXHR request, (=> Offline.confirmUp), (=> Offline.confirmDown)

  if Offline.getOption 'checkOnLoad'
    Offline.check()

# We call init in a setTimeout to give time for options to be set
setTimeout init, 0

window.Offline = Offline
