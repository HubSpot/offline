$(function(){
    var themes = [{
        name: 'default',
        title: 'Default'
    }, {
        name: 'slide',
        title: 'Slide'
    }, {
        name: 'chrome',
        title: 'Chrome'
    }];

    var indicatorThemes = [{
        name: 'default-indicator',
        title: 'Default'
    }, {
        name: 'slide-indicator',
        title: 'Slide'
    }, {
        name: 'chrome-indicator',
        title: 'Chrome'
    }];

    var addThemes = function(themes, selector) {
        $.each(themes, function(i, theme){
            $(selector).append('<div class="theme ' + (i % 2 === 0 ? 'even' : 'odd') + '">'+
                '<h3>' + theme.title + '</h3>' +
                '<p><a href="/offline/themes/offline-theme-' + theme.name + '.css" class="download-link">download</a></p>'+
                '<div class="browser"><iframe data-theme="' + theme.name + '"></iframe></div>' +
            '</div>');
        });
    };

    addThemes(themes, '.full-themes');
    addThemes(indicatorThemes, '.indicator-themes');

    $('.browser iframe').each(function(){
        var _this = this;
        var themeName = $(this).data('theme');

        doc = (this.contentWindow || this.documentWindow).document;
        doc.open();
        doc.write('' +
            '<link rel="stylesheet" href="/offline/themes/offline-theme-' + themeName + '.css" />' +
            '<div class="offline-ui offline-ui-down"><div class="offline-ui-content"></div><a href class="offline-ui-retry"></a></div>' +
        '');
        doc.close();
    });

    setInterval(function(){
        $('.browser iframe').each(function(){
            var $offline = $(this).contents().find('.offline-ui');
            if ($offline.hasClass('offline-ui-down')) {
                $offline.removeClass('offline-ui-down').addClass('offline-ui-up offline-ui-up-2s offline-ui-up-5s');
            } else {
                $offline.removeClass('offline-ui-up offline-ui-up-2s offline-ui-up-5s').addClass('offline-ui-down');
            }
        });
    }, 5000);
});