var castify;

castify = (function () {
    'use strict';

    // private vars
    var chrome = require('./lib/cast_sender'),
        that = {},
        retries = 0, // Chromecast connection retries

        // Chromecast Listeners
        sessionListener = function () {
            console.log('Session Listener');
        },

        receiverListener = function (e) {
            if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
                console.log('Receiver Listener: Available');
            } else {
                console.log('Receiver Listener: Not Available');
            }
        },

        onInitSuccess = function () {
            console.log('Chromecast successfully initiated');
        },

        onInitError = function () {
            throw {
                name: 'InitError',
                message: 'Chromecast could not initiate'
            };
        };

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
        config = new chrome.cast.ApiConfig(session, sessionListener, receiverListener);

        chrome.cast.initialize(config, onInitSuccess, onInitError);

    };

    return that;
}());

module.exports = castify;