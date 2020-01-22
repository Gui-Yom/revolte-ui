"use strict";

import m from "mithril";
import $ from "jquery"
import {exitBtn} from "./messenger";

import "../scss/main.scss"

const root = $("#app");

window.mountApp = (threadId, viewerId, threadType) => {

    if (viewerId == null) {
        m.mount(root, {
            view: () => m(ErrorView, {
                error: "Can't initialize messenger context: " + threadId
                    + ". The exit button below probably won't work. sry"
            })
        });
    } else {

        // TODO remove mainview and make init here

        m.route(root, "/main", {
            "/main": MainView,
            "/newgame": NewGameView,
            "/error": ErrorView,
            "/enroll": EnrollView,
            "/play": PlayView
        });
    }
};

const state = {
    viewerid: null,
    threadid: null,
    threadType: null
};

const MainView = {
    view: () =>
        m("root", [
            m("p", "OK; psid=" + state.viewerid),
            m(exitBtn)
        ])
};

const ErrorView = {
    view: (vnode) =>
        m("root", [
            m("p", {class: "text-danger"}, vnode.attrs.error),
            m(exitBtn)
        ])
};
