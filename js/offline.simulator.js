(function (Offline, document) {

    if (!Offline) {
        throw new Error("Offline simulator brought in without offline.js");
    }

    console.info('The offline.simulator.js module is a development-only resource. Make sure to remove offline.simulator.js in production.');

    var
        scripts = document.getElementsByTagName('script'),
        forceFail = 'data-force-fail';

    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].getAttribute(forceFail) &&
            scripts[i].getAttribute(forceFail) === 'true') {
            window.Offline.options.isSimulating = true;
        }
    }

    Offline.forceChecksToFail = function () {
        Offline.options.checks = {
            image: {
                url: 'simulate-offline-state.png'
            },
            active: 'image'
        };
    };

    if (Offline.options.isSimulating) {
        Offline.forceChecksToFail();
    }

    document.addEventListener('DOMContentLoaded', function () {

        var STYLE = '<style>' +
            '.offline-simulator-ui {' +
            '    position: fixed;' +
            '    z-index: 100000;' +
            '    left: -4px;' +
            '    top: 45%;' +
            '    border: solid 1px rgba(0, 0, 0, 0.15);' +
            '    -webkit-border-radius: 4px 4px 4px 4px;' +
            '    -moz-border-radius: 4px 4px 4px 4px;' +
            '    -ms-border-radius: 4px 4px 4px 4px;' +
            '    -o-border-radius: 4px 4px 4px 4px;' +
            '    border-radius: 4px 4px 4px 4px;' +
            '    font-family: "Lucida Grande", sans-serif;' +
            '    font-size: 12px;' +
            '    padding: 2px;' +
            '    padding-left: 6px;' +
            '    width: 25px;' +
            '    background: #f6f6f6;' +
            '    color: #888888;' +
            '}' +
        '</style>';

        var styleElement = document.createElement('div');
        styleElement.innerHTML = STYLE;

        var body = document.getElementsByTagName('body')[0];

        body.appendChild(styleElement);

        var TEMPLATE = '<input type="checkbox" id="offline-simulator-check" title="Simulate online/offline states">';
        var container = document.createElement('div');
        container.className = 'offline-simulator-ui';
        container.innerHTML = TEMPLATE;
        body.appendChild(container);

        document.getElementById('offline-simulator-check').addEventListener('click', function (e) {
            if (this.checked) {
                Offline.markDown();
            } else {
                Offline.markUp();
            }
        }, false);

        Offline.on('confirmed-up', function () {
            document.getElementById('offline-simulator-check').checked = false;
        });

    }, false);

}(window.Offline, window.document));