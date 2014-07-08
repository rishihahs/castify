var castify;

castify = (function () {
    'use strict';

    // private vars
    var chrome = require('./lib/cast_sender'),
        that = {},
        retries = 0, // Chromecast connection retries
        onAvailable = null, // Callback when ChromeCast is available
        session = null, // chrome.cast.Session
        currentMedia = null, // chrome.cast.media.Media

        // Chromecast Listeners
        sessionListener = function () {
            console.log('Session Listener');
        },

        onRequestSessionSuccess = function (e) {
            session = e;
            onAvailable();
        },

        onLaunchError = function () {
            throw {
                name: 'LaunchError',
                message: 'Could not request session'
            };
        },

        receiverListener = function (e) {
            if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
                console.log('Receiver Listener: Available');

                if (typeof onAvailable === 'function') {
                    chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
                }
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

    that.initialize = function (onAvailableCallback) { // onAvailableCallback called when receiver listner is available
        var appID, sessionRequest, config;

        onAvailable = onAvailableCallback;

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

        sessionRequest = new chrome.cast.SessionRequest(appID);
        config = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

        chrome.cast.initialize(config, onInitSuccess, onInitError);

    };

    that.playMedia = function (currentMediaURL, mimeType) {
        var mediaInfo, request, onMediaDiscovered, onMediaError;

        if (!session) {
            throw {
                name: 'PrematureInvocationError',
                message: 'ChromeCast has not yet been initialized'
            };
        }

        onMediaDiscovered = function (how, media) {
            console.log('Media discovered ' + how);
            currentMedia = media;
        };

        onMediaError = function (e) {
            console.log(e);
            throw {
                name: 'MediaError',
                message: 'Error starting media'
            };
        };

        mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL, mimeType);
        request = new chrome.cast.media.LoadRequest(mediaInfo);
        session.loadMedia(request,
            onMediaDiscovered.bind(this, 'loadMedia'),
            onMediaError);
    };

    return that;
}());

module.exports = castify;