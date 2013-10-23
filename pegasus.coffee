unless window.Offline
  throw new Error "Pegasus brought in without offline.js"

held = []

waitingOnConfirm = false
holdRequest = (req) ->
  console.log 'holding',req
  if Offline.state isnt 'down'
    waitingOnConfirm = true

  held.push req

makeRequest = ({xhr, url, type, user, password, body}) ->
  console.log 'remaking', xhr
  xhr.abort()
  xhr.open(type, url, true, user, password)
  xhr.setRequestHeader(name, val) for name, val of xhr.headers

  if xhr.mimeType
    xhr.overrideMimeType xhr.mimeType

  xhr.send(body)

clear = ->
  console.log 'clearing'
  held = []

flush = ->
  requests = {}
  # Dedup requests, favoring the later request
  # TODO: Throw out PUT/POST/DELETE requests after too much time?
  console.log 'flush'
  for request in held
    # Break cache breaking
    url = request.url.replace /(\?|&)_=[0-9]+/, (match, char) ->
      if char is '?' then char else ''

    requests["#{ request.type.toUpperCase() } - #{ url }"] = request

  for key, request of requests
    makeRequest request

  clear()

Offline.on 'confirmed-up', ->
  if waitingOnConfirm
    waitingOnConfirm = false
    clear()

Offline.on 'up', flush

Offline.on 'down', ->
  waitingOnConfirm = false

Offline.onXHR (request) ->
  {xhr, async} = request

  console.log 'on xhr', request
  hold = -> holdRequest request

  _send = xhr.send
  xhr.send = (body) ->
    console.log 'sending', body
    request.body = body

    _send.apply xhr, arguments

  return unless async

  if xhr.onprogress is null
    xhr.addEventListener 'error', hold, false
    xhr.addEventListener 'timeout', hold, false
  else
    _onreadystatechange = xhr.onreadystatechange
    xhr.onreadystatechange = ->
      if xhr.readyState is 0
        hold()
      else if xhr.readyState is 4 and (xhr.status is 0 or xhr.status >= 12000)
        hold()

      _onreadystatechange?(arguments...)

Offline.requests = {
  flush,
  clear
}
