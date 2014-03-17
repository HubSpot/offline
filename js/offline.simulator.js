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

        var STYLE = '<style>.offline-ui {cursor: pointer;}</style>';

        var styleContainer = document.createElement('div');
        styleContainer.innerHTML = STYLE;

        document.getElementsByTagName('body')[0].appendChild(styleContainer);

        var indicator = document.getElementsByClassName('offline-ui')[0];
        indicator.addEventListener('click', function (e) {

            if (Offline.state == 'up') {
                Offline.markDown();
            } else {
                Offline.markUp();
            }
        }, false);

    }, false);

}(window.Offline, window.document));