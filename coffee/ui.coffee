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

formatTime = (sec) ->
  formatters =
    'd': 86400
    'h': 3600
    'm': 60
    's': 1

  out = ''
  for letter, mult of formatters
    if sec >= mult
      out += "#{ Math.floor(sec / mult) }#{ letter } "
      sec = sec % mult

  out or= 'now'
  out.trim()

render = ->
  el = createFromHTML TEMPLATE
  document.body.appendChild el

  if Offline.reconnect?
    el.appendChild createFromHTML RETRY_TEMPLATE

    # TODO: IE8
    el.querySelector('.offline-ui-retry').addEventListener 'click', (e) ->
      e.preventDefault()

      Offline.reconnect.tryNow()
    , false

  addClass "offline-ui-#{ Offline.state }"

  content = el.querySelector('.offline-ui-content')

document.addEventListener 'DOMContentLoaded', ->
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
    content.setAttribute 'data-retry-in', formatTime(Offline.reconnect.remaining)

  Offline.on 'reconnect:stopped', ->
    removeClass 'offline-ui-connecting offline-ui-waiting'

    content.setAttribute 'data-retry-in-seconds', null
    content.setAttribute 'data-retry-in', null

  Offline.on 'reconnect:failure', ->
    flashClass 'offline-ui-reconnect-failed-2s', 2
    flashClass 'offline-ui-reconnect-failed-5s', 5

  Offline.on 'reconnect:success', ->
    flashClass 'offline-ui-reconnect-succeeded-2s', 2
    flashClass 'offline-ui-reconnect-succeeded-5s', 5
