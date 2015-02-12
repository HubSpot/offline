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
  checks:
    xhr:
      url: ->
        # This can be any endpoint, even one that will 404.
        "/favicon.ico?_=#{ Math.floor(Math.random() * 1000000000) }"
      timeout: 5000

    image:
      url: ->
        # This can be any image, this is the better option if your image is on a different domain, otherwise just use XHR
        "/favicon.ico?_=#{ Math.floor(Math.random() * 1000000000) }"

    active: 'xhr'

  checkOnLoad: false

  interceptRequests: true

  reconnect: true

grab = (obj, key) ->
  cur = obj
  parts = key.split('.')
  for part, i in parts
    cur = cur[part]
    break if typeof cur isnt 'object'

  if i is parts.length - 1
    cur
  else
    undefined

Offline.getOption = (key) ->
  val = grab(Offline.options, key) ? grab(defaultOptions, key)

  if typeof val is 'function'
    val()
  else
    val

# These events are available in modern browsers, but they mean different things.
# In FF and IE they mean the user has explicitly entered "Offline Mode"
# In Chrome they mean that the internet connection was lost or restored
window.addEventListener? 'online', ->
  # The event fires slightly before the browser is ready to make a request
  setTimeout Offline.confirmUp, 100
, false

window.addEventListener? 'offline', ->
  Offline.confirmDown()
, false

Offline.state = 'up'

Offline.markUp = ->
  Offline.trigger 'confirmed-up'

  return if Offline.state is 'up'

  Offline.state = 'up'
  Offline.trigger 'up'

Offline.markDown = ->
  Offline.trigger 'confirmed-down'

  return if Offline.state is 'down'

  Offline.state = 'down'
  Offline.trigger 'down'

handlers = {}

Offline.on = (event, handler, ctx) ->
  events = event.split(' ')

  if events.length > 1
    Offline.on(e, handler, ctx) for e in events
  else
    handlers[event] ?= []
    handlers[event].push [ctx, handler]

Offline.off = (event, handler) ->
  return unless handlers[event]?

  if not handler
    handlers[event] = []
  else
    i = 0
    while i < handlers[event].length
      [ctx, _handler] = handlers[event][i]
      if _handler is handler
        handlers[event].splice i, 1
      else
        i++

Offline.trigger = (event) ->
  if handlers[event]?
    for [ctx, handler] in handlers[event]
      handler.call(ctx)

checkXHR = (xhr, onUp, onDown) ->
  checkStatus = ->
    if xhr.status and xhr.status < 12000
      onUp()
    else
      onDown()

  if xhr.onprogress is null
    # onprogress would be undefined on older browsers

    # XDomainRequest doesn't implement addEventListener
    _onerror = xhr.onerror
    xhr.onerror = ->
      onDown()

      _onerror?(arguments...)

    _ontimeout = xhr.ontimeout
    xhr.ontimeout = ->
      onDown()

      _ontimeout?(arguments...)

    _onload = xhr.onload
    xhr.onload = ->
      checkStatus()

      _onload?(arguments...)
  else
    _onreadystatechange = xhr.onreadystatechange
    xhr.onreadystatechange = ->
      if xhr.readyState is 4
        checkStatus()
      else if xhr.readyState is 0
        onDown()

      _onreadystatechange?(arguments...)

Offline.checks = {}
Offline.checks.xhr = ->
  xhr = new XMLHttpRequest

  xhr.offline = false

  # It doesn't matter what this hits, even a 404 is considered up.  It is important however that
  # it's on the same domain and port, so CORS issues don't come into play.
  xhr.open('HEAD', Offline.getOption('checks.xhr.url'), true)

  if xhr.timeout?
    xhr.timeout = Offline.getOption('checks.xhr.timeout')

  checkXHR xhr, Offline.markUp, Offline.markDown

  try
    xhr.send()
  catch e
    # Catch NETWORK_ERRORS
    Offline.markDown()

  xhr

Offline.checks.image = ->
  img = document.createElement 'img'
  img.onerror = Offline.markDown
  img.onload = Offline.markUp
  img.src = Offline.getOption('checks.image.url')

  undefined

Offline.checks.down = Offline.markDown
Offline.checks.up = Offline.markUp

Offline.check = ->
  Offline.trigger 'checking'

  Offline.checks[Offline.getOption('checks.active')]()

Offline.confirmUp = Offline.confirmDown = Offline.check

Offline.onXHR = (cb) ->
  monitorXHR = (req, flags) ->
    _open = req.open
    req.open = (type, url, async, user, password) ->
      cb {type, url, async, flags, user, password, xhr: req}

      _open.apply req, arguments

  _XMLHttpRequest = window.XMLHttpRequest
  window.XMLHttpRequest = (flags) ->
    req = new _XMLHttpRequest(flags)

    monitorXHR req, flags

    _setRequestHeader = req.setRequestHeader
    req.headers = {}
    req.setRequestHeader = (name, value) ->
      req.headers[name] = value

      _setRequestHeader.call req, name, value

    _overrideMimeType = req.overrideMimeType
    req.overrideMimeType = (type) ->
      req.mimeType = type

      _overrideMimeType.call req, type

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
    Offline.onXHR ({xhr}) ->
      unless xhr.offline is false
        checkXHR xhr, Offline.markUp, Offline.confirmDown

  if Offline.getOption 'checkOnLoad'
    Offline.check()

# We call init in a setTimeout to give time for options to be set
setTimeout init, 0

window.Offline = Offline
