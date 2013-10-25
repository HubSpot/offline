unless window.Offline
  throw new Error "Offline UI brought in without offline.js"

TEMPLATE = '<div class="offline-ui"><div class="offline-ui-content"></div></div>'
RETRY_TEMPLATE = '<a href class="offline-ui-retry"></a>'

createFromHTML = (html) ->
  el = document.createElement('div')
  el.innerHTML = html
  el.children[0]

el = content = null
addClass = (name) ->
  removeClass name
  el.className += " #{ name }"

removeClass = (name) ->
  el.className = el.className.replace new RegExp("(^| )#{ name.split(' ').join('|') }( |$)", 'gi'), ' '

flashTimeouts = {}
flashClass = (name, time) ->
  addClass name

  if flashTimeouts[name]?
    clearTimeout flashTimeouts[name]

  flashTimeouts[name] = setTimeout ->
    removeClass name
    delete flashTimeouts[name]
  , time * 1000

formatTime = (sec, long=false) ->
  return 'now' if sec is 0

  formatters =
    'd': 86400
    'h': 3600
    'm': 60
    's': 1

  longUnits =
    's': 'second'
    'm': 'minute'
    'h': 'hour'
    'd': 'day'

  out = ''
  for unit, mult of formatters
    if sec >= mult
      val = Math.floor(sec / mult)

      if long
        unit = " #{ longUnits[unit] }"
        unit += 's' if val isnt 1

      return "#{ val }#{ unit }"

render = ->
  el = createFromHTML TEMPLATE
  document.body.appendChild el

  if Offline.reconnect?
    el.appendChild createFromHTML RETRY_TEMPLATE

    button = el.querySelector('.offline-ui-retry')
    handler = (e) ->
      e.preventDefault()

      Offline.reconnect.tryNow()

    if button.addEventListener?
      button.addEventListener 'click', handler, false
    else
      button.attachEvent 'click', handler

  addClass "offline-ui-#{ Offline.state }"

  content = el.querySelector('.offline-ui-content')

init = ->
  render()

  Offline.on 'up', ->
    removeClass 'offline-ui-down'
    addClass 'offline-ui-up'

    flashClass 'offline-ui-up-2s', 2
    flashClass 'offline-ui-up-5s', 5

  Offline.on 'down', ->
    removeClass 'offline-ui-up'
    addClass 'offline-ui-down'

    flashClass 'offline-ui-down-2s', 2
    flashClass 'offline-ui-down-5s', 5

  Offline.on 'reconnect:connecting', ->
    addClass 'offline-ui-connecting'
    removeClass 'offline-ui-waiting'

  Offline.on 'reconnect:tick', ->
    addClass 'offline-ui-waiting'
    removeClass 'offline-ui-connecting'

    content.setAttribute 'data-retry-in-seconds', Offline.reconnect.remaining
    content.setAttribute 'data-retry-in-abbr', formatTime(Offline.reconnect.remaining)
    content.setAttribute 'data-retry-in', formatTime(Offline.reconnect.remaining, true)

  Offline.on 'reconnect:stopped', ->
    removeClass 'offline-ui-connecting offline-ui-waiting'

    content.setAttribute 'data-retry-in-seconds', null
    content.setAttribute 'data-retry-in-abbr', null
    content.setAttribute 'data-retry-in', null

  Offline.on 'reconnect:failure', ->
    flashClass 'offline-ui-reconnect-failed-2s', 2
    flashClass 'offline-ui-reconnect-failed-5s', 5

  Offline.on 'reconnect:success', ->
    flashClass 'offline-ui-reconnect-succeeded-2s', 2
    flashClass 'offline-ui-reconnect-succeeded-5s', 5

if document.addEventListener?
  document.addEventListener 'DOMContentLoaded', init, false
else
  # IE8

  _onreadystatechange = document.onreadystatechange
  document.onreadystatechange = ->
    if document.readyState is 'complete'
      init()

    _onreadystatechange?(arguments...)
