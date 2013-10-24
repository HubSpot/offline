unless window.Offline
  throw new Error "Offline UI brought in without offline.js"

TEMPLATE = '<div class="offline-ui"></div>'
RETRY_TEMPLATE = '<a href class="offline-ui-retry">Retry Now</a>'

createFromHTML = (html) ->
  el = document.createElement('div')
  el.innerHTML = html
  el.children[0]

addClass = (el, name) ->
  removeClass el, name
  el.className += " #{ name }"

removeClass = (el, name) ->
  el.className = el.className.replace new RegExp("(^| )#{ name.split(' ').join('|') }( |$)", 'gi'), ' '

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

el = null
do render = ->
  unless el?
    el = createFromHTML TEMPLATE
    document.body.appendChild el

    if Offline.reconnect?
      el.appendChild createFromHTML RETRY_TEMPLATE

      # TODO: IE8
      el.querySelector('.offline-ui-retry').addEventListener 'click', (e) ->
        e.preventDefault()

        Offline.reconnect.tryNow()
      , false

  if Offline.state is 'up'
    removeClass el, 'offline-ui-down'
    addClass el, 'offline-ui-up'
  else
    removeClass el, 'offline-ui-up'
    addClass el, 'offline-ui-down'

Offline.on 'reconnect:connecting', ->
  addClass el, 'offline-ui-connecting'
  removeClass el, 'offline-ui-waiting'

Offline.on 'reconnect:tick', ->
  addClass el, 'offline-ui-waiting'
  removeClass el, 'offline-ui-connecting'

  el.setAttribute 'data-retry-in-seconds', Offline.reconnect.remaining
  el.setAttribute 'data-retry-in', formatTime(Offline.reconnect.remaining)

Offline.on 'reconnect:stopped', ->
  removeClass el, 'offline-ui-connecting offline-ui-waiting offline-ui-reconnecting'

  el.setAttribute 'data-retry-in-seconds', null
  el.setAttribute 'data-retry-in', null

Offline.on 'reconnect:started', ->
  addClass el, 'offline-ui-reconnecting'

reconnectFailureTimeouts = []
Offline.on 'reconnect:failure', ->
  addClass el, 'offline-ui-reconnect-failed-2s offline-ui-reconnect-failed-5s'

  clearTimeout(timeout) for timeout in reconnectFailureTimeouts
  reconnectFailureTimeouts = []

  reconnectFailureTimeouts.push setTimeout ->
    removeClass el, 'offline-ui-reconnect-failed-2s'
  , 2000

  reconnectFailureTimeouts.push setTimeout ->
    removeClass el, 'offline-ui-reconnect-failed-5s'
  , 5000

reconnectSuccessTimeouts = []
Offline.on 'reconnect:success', ->
  addClass el, 'offline-ui-reconnect-succeeded-2s offline-ui-reconnect-succeeded-5s'

  clearTimeout(timeout) for timeout in reconnectSuccessTimeouts
  reconnectSuccessTimeouts = []

  reconnectSuccessTimeouts.push setTimeout ->
    removeClass 'offline-ui-reconnect-succeeded-2s'
  , 2000

  reconnectSuccessTimeouts.push setTimeout ->
    removeClass 'offline-ui-reconnect-succeeded-5s'
  , 5000
  
Offline.on 'up down', render
