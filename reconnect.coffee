unless window.Offline
  throw new Error "Offline Reconnect brought in without offline.js"

INITIAL_DELAY = 3

rc = Offline.reconnect = {}

retryIntv = null

do reset = ->
  if rc.state?
    Offline.trigger 'reconnect:stopped'

  rc.state = 'inactive'
  rc.remaining = rc.delay = INITIAL_DELAY

next = ->
  rc.remaining = rc.delay = Math.ceil(rc.delay * 1.5)

tick = ->
  return if rc.state is 'connecting'

  rc.remaining -= 1

  if rc.remaining is 0
    tryNow()
  else
    Offline.trigger 'reconnect:tick'

tryNow = ->
  return if rc.state isnt 'waiting'

  Offline.trigger 'reconnect:connecting'
  rc.state = 'connecting'

  Offline.check()

down = ->
  rc.state = 'waiting'
  Offline.trigger 'reconnect:started'
  retryIntv = setInterval tick, 1000

up = ->
  clearInterval retryIntv
  reset()

nope = ->
  console.log 'nope',rc.state
  if rc.state is 'connecting'
    Offline.trigger 'reconnect:failure'
    rc.state = 'waiting'
    console.log 'next'
    next()

Offline.on 'down', down
Offline.on 'confirmed-down', nope
Offline.on 'up', up

rc.tryNow = tryNow
