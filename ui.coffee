unless window.Offline
  throw new Error "Offline UI brought in without offline.js"

TEMPLATE = '<div class="offline-ui"></div>'

createFromHTML = (html) ->
  el = document.createElement('div')
  el.innerHTML = html
  el.children[0]

addClass = (el, name) ->
  el.className += " #{ name }"

removeClass = (el, name) ->
  el.className = el.className.replace new RegExp(name.split(' ').join('|'), 'gi'), ''

el = null
do render = ->
  unless el?
    el = createFromHTML TEMPLATE
    document.body.appendChild el

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

  el.setAttribute 'data-retry-in', Offline.reconnect.remaining

Offline.on 'reconnect:stopped', ->
  removeClass el, 'offline-ui-connecting offline-ui-waiting offline-ui-reconnecting'

  el.setAttribute 'data-retry-in', null

Offline.on 'reconnect:started', ->
  addClass el, 'offline-ui-reconnecting'
  
Offline.on 'up down', render
