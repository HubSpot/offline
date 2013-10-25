Offine
======

Improve the experience of your app when your users lose connection.

- Monitors ajax requests looking for failure
- Confirms the connection status by requesting an image or fake resource
- Automatically grabs ajax requests made while the connection is down and remakes them
  after the connection is restored.
- Simple UI with beautiful themes
- 3kb minified and compressed

Installing
----------

Include [the javascript](https://raw.github.com/HubSpot/offline/v0.4.0/offline.min.js) and one of [the themes](http://github.hubspot.com/offline/docs/welcome/) on your site.  You're done!

Advanced
--------

Optionally, you can provide some configuration by setting `Offline.options` after
bringing in the script.

Options (any can be provided as a function), with their defaults:

```javascript
{
  // Should we check the connection status immediatly on page load.
  checkOnLoad: false,

  // Should we monitor AJAX requests to help decide if we have a connection.
  interceptRequests: true,

  // Should we automatically retest periodically when the connection is down (set to false to disable).
  reconnect: {
    // How many seconds should we wait before rechecking.
    initialDelay: 3,
  
    // How long should we wait between retries.
    delay: (1.5 * last delay, capped at 1 hour)
  },

  // Should we store and attempt to remake requests which fail while the connection is down.
  requests: true

  // Should we show a snake game while the connection is down to keep the user entertained?
  game: false
}
```

Properties
----------

`Offline.check()`: Check the current status of the connection.

`Offline.state`: The current state of the connection 'up' or 'down'

`Offline.on(event, handler, context)`: Bind an event.  Events:

  - up: The connection has gone from down to up
  - down: The connection has gone from up to down
  - confirmed-up: A connection test has succeeded, fired even if the connection was already up
  - confirmed-down: A connection test has failed, fired even if the connection was already down
  - checking: We are testing the connection

  - reconnect:started: We are beginning the reconnect process
  - reconnect:stopped: We are done attempting to reconnect
  - reconnect:tick: Fired every second during a reconnect attempt, when a check is not happening
  - reconnect:connecting: We are reconnecting now
  - reconnect:failure: A reconnect check attempt failed

  - requests:flush: Any pending requests have been remade
  - requests:hold: A new request is being held

`Offline.off(event, handler)`: Unbind an event

Reconnect
---------

The reconnect module automatically retests the connection periodically when it is down.
A successful AJAX request will also trigger a silent recheck (if `interceptRequests` is not false).

You can disable the reconnect module by setting the `reconnect` to false.  Reconnect can be
configured by setting options on the reconnect setting.

Requests
--------

The requests module holds any failed AJAX requests and, after deduping them, remakes them when the connection
is restored.

You can disable it by setting the `requests` setting to false.

Dependencies
------------

None!

Browser Support
---------------

Modern Chrome, Firefox, Safari and IE8+
