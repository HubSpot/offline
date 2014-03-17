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
    STYLE = "<style>" + 
            ".offline-simulator-ui {" + 
            "    position: fixed;" + 
            "    z-index: 100000;" + 
            "    left: -4px;" + 
            "    top: 45%;" + 
            "    border: solid 1px rgba(0, 0, 0, 0.15);" + 
            "    -webkit-border-radius: 4px 4px 4px 4px;" + 
            "    -moz-border-radius: 4px 4px 4px 4px;" + 
            "    -ms-border-radius: 4px 4px 4px 4px;" + 
            "    -o-border-radius: 4px 4px 4px 4px;" + 
            "    border-radius: 4px 4px 4px 4px;" + 
            "    font-family: \"Lucida Grande\", sans-serif;" + 
            "    font-size: 12px;" + 
            "    padding: 2px;" + 
            "    padding-left: 6px;" + 
            "    width: 25px;" + 
            "    background: #f6f6f6;" + 
            "    color: #888888;" + 
            "}" + 
            "</style>"

    styleElement = document.createElement("div")
    styleElement.innerHTML = STYLE

    body = document.getElementsByTagName("body")[0]

    body.appendChild styleElement

    TEMPLATE = "<input type=\"checkbox\" id=\"offline-simulator-check\" title=\"Simulate online/offline states\">"

    container = document.createElement("div")
    container.className = "offline-simulator-ui"
    container.innerHTML = TEMPLATE
    body.appendChild container

    document.getElementById("offline-simulator-check").addEventListener "click", ((e) ->
      if @checked
        Offline.markDown()
      else
        Offline.markUp()
      return
    ), false

    Offline.on "confirmed-up", ->
      document.getElementById("offline-simulator-check").checked = false
      return

    return
  ), false
  return
) window.Offline, window.document