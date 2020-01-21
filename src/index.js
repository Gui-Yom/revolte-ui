"use strict";

import m from "mithril";
import $ from "jquery"
import {ErrorView} from "./errorview"

import "../favicon.ico"

window.mountApp = (threadId, viewerId, threadType) => {

    if (viewerId == null) {
        m.mount(document.body, {
            view: () => m(ErrorView, {error: threadId})
        });
    }

    m.route($("root"), "/main", {
        "/main": MainView,
        "/newgame": NewGameView,
        "/error": ErrorView,
        "/enroll": EnrollView,
        "/play": PlayView
    });
};

let state = {
    psid: null,
    tid: null,
    ttype: null,
    gameid: null,
    playerid: null,
    error: null,
    gamephase: null,

    init: function () {

        MessengerExtensions.getContext(
            pageId,
            function success(context) {
                // Display the webview in messenger
                state.psid = context.psid;
                state.tid = context.tid;
                state.ttype = context.thread_type;

                m.request({
                    method: "GET",
                    url: baseUrl + "/game",
                    params: {tid: tid}
                }).then(function (data) {
                    state.gameid = data.gameid;

                    m.request({
                        method
                    })
                }).catch(function (e) {
                    if (e.code !== 404) {
                        state.error = "Can't retrieve game info : " + e.code;
                        m.route.set("/error");
                    }
                })
            }, function error(e) {
                state.error = "Unable to access messenger context : " + e;
                m.route.set("/error");
            });
    },
};

// Main component
let MainView = {
    oninit: state.init,
    view: function () {

    }
};

let NewGameView = {
    view: function () {
        return m("root", [
            m("h3", {class: "title"}, "Révolté"),
            m("p", {}, "This webview was opened from thread: " + tid + ", type: " + ttype),
            m("button", {
                onclick: function () {
                    m.request({
                        method: "POST",
                        url: baseUrl + "/game",
                        body: {tid: tid}
                    }).then(function (data) {
                        state.gameid = data.gameid;
                    })
                }
            }, "New game"),
            m(exitBtn)
        ])
    }
};
