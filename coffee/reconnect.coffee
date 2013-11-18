unless window.Offline
  throw new Error "Offline Reconnect brought in without offline.js"

rc = Offline.reconnect = {}

retryIntv = null

reset = ->
  if rc.state? and rc.state isnt 'inactive'
    Offline.trigger 'reconnect:stopped'

  rc.state = 'inactive'
  rc.remaining = rc.delay = Offline.getOption('reconnect.initialDelay') ? 3

next = ->
  delay = Offline.getOption('reconnect.delay') ? Math.min(Math.ceil(rc.delay * 1.5), 3600)
  rc.remaining = rc.delay = delay

tick = ->
  return if rc.state is 'connecting'

  rc.remaining -= 1

  Offline.trigger 'reconnect:tick'
  if rc.remaining is 0
    tryNow()

tryNow = ->
  return if rc.state isnt 'waiting'

  Offline.trigger 'reconnect:connecting'
  rc.state = 'connecting'

  Offline.check()

down = ->
  return unless Offline.getOption('reconnect')

  reset()

  rc.state = 'waiting'
  
  Offline.trigger 'reconnect:started'
  retryIntv = setInterval tick, 1000

up = ->
  if retryIntv?
    clearInterval retryIntv

  reset()

nope = ->
  return unless Offline.getOption('reconnect')

  if rc.state is 'connecting'
    Offline.trigger 'reconnect:failure'
    rc.state = 'waiting'
    next()

rc.tryNow = tryNow

reset()

Offline.on 'down', down
Offline.on 'confirmed-down', nope
Offline.on 'up', up
