//"use strict";

import $ from "jquery";

const MessengerExt = {
    loaded: false,
    load: (pageId, success, error) => {
        window.extAsyncInit = () => {
            MessengerExt.loaded = true;
            console.log("Loaded Messenger Extensions !");
            window.MessengerExtensions.getContext(pageId, success, error);
        };
        $.getScript("//connect.facebook.net/en_US/messenger.Extensions.js", () => {

        })
    },
    exit: () => {
        if (MessengerExt.loaded) {
            window.MessengerExtensions.requestCloseBrowser(function success() {
                // SUCCESS
            }, function error(err) {
                console.log(err)
            });
        } else {
            // NO
        }
    }
};

export default MessengerExt;