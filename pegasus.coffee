unless window.Offline
  throw new Error "Pegasus brought in without offline.js"

held = []

holdRequest = (req) ->
  console.log 'holding',req
  held.push req

makeRequest = ({xhr}) ->
  console.log 'remaking', xhr
  xhr.abort()
  xhr.send()

clear = ->
  held = []

flush = ->
  requests = {}
  # Dedup requests, favoring the later request
  # TODO: Don't hang onto cross origin requests if we're not already down
  # TODO: Throw out PUT/POST/DELETE requests after too much time?
  console.log 'flush'
  for request in held
    # Ignore jQuery cache breaking
    url = url.replace /(?|&)_=[0-9]+/, (match, char) ->
      if char is '?' then char else ''

    requests["#{ request.type.toUpperCase() } - #{ url }"] = request

  for key, request of requests
    makeRequest request

  clear()

Offline.on 'up', flush

Offline.onXHR ({xhr, async}) ->
  hold = -> holdRequest arguments[0]

  return unless async

  if xhr.onprogress is null
    xhr.addEventListener 'error', hold, false
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
