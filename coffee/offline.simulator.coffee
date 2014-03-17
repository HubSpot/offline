((Offline, document) ->
  throw new Error("Offline simulator brought in without offline.js")  unless Offline

  console.info "The offline.simulator.js module is a development-only resource. Make sure to remove offline.simulator.js in production."

  scripts = document.getElementsByTagName("script")
  forceFail = "data-force-fail"
  i = 0

  while i < scripts.length
    window.Offline.options.isSimulating = true  if scripts[i].getAttribute(forceFail) and scripts[i].getAttribute(forceFail) is "true"
    i++

  Offline.forceChecksToFail = ->
    Offline.options.checks =
      image:
        url: "simulate-offline-state.png"

      active: "image"

    return

  Offline.forceChecksToFail()  if Offline.options.isSimulating

  document.addEventListener "DOMContentLoaded", (->

    STYLE = "<style>.offline-ui {cursor: pointer;}</style>"
    styleContainer = document.createElement("div")
    styleContainer.innerHTML = STYLE
    document.getElementsByTagName("body")[0].appendChild styleContainer

    indicator = document.getElementsByClassName("offline-ui")[0]

    indicator.addEventListener "click", ((e) ->
      if Offline.state is "up"
        Offline.markDown()
      else
        Offline.markUp()
      return
    ), false
    return
  ), false
  return
) window.Offline, window.document