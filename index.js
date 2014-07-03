var castify;

castify = function () {
    'use strict';

    // private vars
    var chrome = require('./lib/cast_sender'),
        that = {},
        retries = 0; // Chromecast connection retries

    that.initialize = function () {
        var appID, session, config;

        // Check if chromecast is available
        // retry if not
        if (!chrome.cast || !chrome.cast.isAvailable) {
            // Assume there is no Chromecast extention installed
            // after 10 retries
            retries += 1;
            if (retries > 10) {
                throw {
                    name: 'ExtentionError',
                    message: 'Chromecast extention is not installed'
                };
            }

            setTimeout(that.initialize, 1000);
            return;
        }

        // Initialize Chromecast
        appID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;

        session = new chrome.cast.SessionRequest(appID);
        config = new chrome.cast.ApiConfig(session);

        chrome.cast.initialize(config);

    };
};