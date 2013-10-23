unless window.Offline
  throw new Error "Offline UI brought in without offline.js"

TEMPLATE = '<div class="offline-ui"></div>'

createFromHTML = (html) ->
  el = document.createElement('div')
  el.innerHTML = html
  el.children[0]

el = null
do render = ->
  if el
    el.parentNode.removeChild el

  el = createFromHTML TEMPLATE
  document.body.appendChild el

  if Offline.state is 'up'
    el.className += ' offline-ui-up'
  else
    el.className += ' offline-ui-down'
  
Offline.on 'up down', render
