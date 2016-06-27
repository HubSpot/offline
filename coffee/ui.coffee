unless window.Offline
  throw new Error "Offline UI brought in without offline.js"

TEMPLATE = '<div class="offline-ui"><div class="offline-ui-content"></div></div>'
RETRY_TEMPLATE = '<a href class="offline-ui-retry"></a>'
SIGN_IN_TEMPLATE = '<a href class="offline-ui-sign-in"></a>'
MODAL_TEMPLATE = '<div class="offline-modal">'

createFromHTML = (html) ->
  el = document.createElement('div')
  el.innerHTML = html
  el.children[0]

el = content = modal = null
addClass = (name) ->
  removeClass name
  el.className += " #{ name }"
  modal.className += " #{ name }" if modal

removeClass = (name) ->
  el.className = (el.className.replace new RegExp("(^| )#{ name.split(' ').join('|') }( |$)", 'gi'), ' ').split(/\s+/).join(' ')
  modal.className = (modal.className.replace new RegExp("(^| )#{ name.split(' ').join('|') }( |$)", 'gi'), ' ').split(/\s+/).join(' ') if modal

flashTimeouts = {}
flashClass = (name, time) ->
  addClass name

  if flashTimeouts[name]?
    clearTimeout flashTimeouts[name]

  flashTimeouts[name] = setTimeout ->
    removeClass name
    delete flashTimeouts[name]
  , time * 1000

roundTime = (sec) ->
  units =
    'day': 86400
    'hour': 3600
    'minute': 60
    'second': 1

  for unit, mult of units
    if sec >= mult
      val = Math.floor(sec / mult)

      return [val, unit]

  return ['now', '']

render = ->
  el = createFromHTML TEMPLATE
  document.body.appendChild el

  if Offline.reconnect? and Offline.getOption('reconnect')
    el.appendChild createFromHTML RETRY_TEMPLATE

    button = el.querySelector('.offline-ui-retry')
    handler = (e) ->
      e.preventDefault()

      Offline.reconnect.tryNow()

    if button.addEventListener?
      button.addEventListener 'click', handler, false
    else
      button.attachEvent 'click', handler

  if Offline.getOption('unauthorized')
    el.appendChild createFromHTML SIGN_IN_TEMPLATE

    button = el.querySelector('.offline-ui-sign-in')
    handler = (e) ->
      e.preventDefault()
      location.reload();

    if button.addEventListener?
      button.addEventListener 'click', handler, false
    else
      button.attachEvent 'click', handler

  if Offline.getOption('modal')
    modal = createFromHTML MODAL_TEMPLATE
    document.body.appendChild modal

  addClass "offline-ui-#{ Offline.state }"

  content = el.querySelector('.offline-ui-content')

init = ->
  render()

  Offline.on 'up', ->
    removeClass 'offline-ui-down'
    removeClass 'offline-ui-unauthorized'
    addClass 'offline-ui-up'

    flashClass 'offline-ui-up-2s', 2
    flashClass 'offline-ui-up-5s', 5

  Offline.on 'down', ->
    removeClass 'offline-ui-up'
    removeClass 'offline-ui-unauthorized'
    addClass 'offline-ui-down'

    flashClass 'offline-ui-down-2s', 2
    flashClass 'offline-ui-down-5s', 5

  Offline.on 'unauthorized', ->
    removeClass 'offline-ui-up'
    removeClass 'offline-ui-down'
    addClass 'offline-ui-unauthorized'

    flashClass 'offline-ui-unauthorized-2s', 2
    flashClass 'offline-ui-unauthorized-5s', 5

  Offline.on 'reconnect:connecting', ->
    addClass 'offline-ui-connecting'
    removeClass 'offline-ui-waiting'

  Offline.on 'reconnect:tick', ->
    addClass 'offline-ui-waiting'
    removeClass 'offline-ui-connecting'

    [time, unit] = roundTime Offline.reconnect.remaining

    content.setAttribute 'data-retry-in-value', time
    content.setAttribute 'data-retry-in-unit', unit

  Offline.on 'reconnect:stopped', ->
    removeClass 'offline-ui-connecting offline-ui-waiting'

    content.setAttribute 'data-retry-in-value', null
    content.setAttribute 'data-retry-in-unit', null

  Offline.on 'reconnect:failure', ->
    flashClass 'offline-ui-reconnect-failed-2s', 2
    flashClass 'offline-ui-reconnect-failed-5s', 5

  Offline.on 'reconnect:success', ->
    flashClass 'offline-ui-reconnect-succeeded-2s', 2
    flashClass 'offline-ui-reconnect-succeeded-5s', 5

if document.readyState is 'complete'
  init()
else if document.addEventListener?
  document.addEventListener 'DOMContentLoaded', init, false
else
  # IE8

  _onreadystatechange = document.onreadystatechange
  document.onreadystatechange = ->
    if document.readyState is 'complete'
      init()

    _onreadystatechange?(arguments...)
