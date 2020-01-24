"use strict";

import m from "mithril";
import $ from "jquery"
import {exitBtn} from "./messenger";

import "../scss/main.scss"

const root = $("#app")[0];

export let apiUrl;

window.mountApp = (threadId, viewerId, threadType, apiUrl) => {

    m.route(root, "/loading", {
        "/loading": LoadingView,
        "/start/:action": StartView,
        "/newgame": NewGameView,
        //"/error": ErrorView,
        "/play": PlayView
    });

    if (viewerId == null) {
        m.mount(root, {
            view: () => m(ErrorView, {
                error: "Impossible d'initialiser le contexte messenger: " + threadId
            })
        });
    } else {
        this.apiUrl = apiUrl;
        state.threadid = threadId;
        state.viewerid = viewerId;
        state.threadType = threadType;

        m.request({
            method: "GET",
            url: apiUrl + "/game/:threadId",
            params: {threadId: threadId},
            async: false
        }).then(data => {
            console.log(data);
            state.phase = data.phase;
            if (data.phase === "join") {
                if (data.players.includes(viewerId))
                    m.route.set("/play");
                else
                    m.route.set("/start/:action", {action: "join"});
            }
        }, err => {
            if (err.code === 404)
                m.route.set("/start/:action", {action: "create"});
            else
                console.log(err);
        });
    }
};

const state = {
    viewerid: null,
    threadid: null,
    threadType: null,
    phase: null,
    turn: null
};

function startAction(action) {
    if (action === "create") {
        m.route.set("/newgame");
    } else if (action === "join") {
        m.request({
            method: "POST",
            url: apiUrl + "/game/:threadId/join",
            params: {threadId: state.threadid, playerId: state.viewerid},
            async: false
        }).then(data => {
            m.route.set("/play");
        }, err => {
            console.log(err);
        });
    }
}

const StartView = {
    view: vnode =>
        m("root", [
            m("div.d-flex.h-100.justify-content-center.align-items-center", m("h1.display-4", "Révolté")),
            m("button.btn.btn-primary.btn-block.fixed-bottom", {
                onclick: () => startAction(vnode.attrs.action),
                style: "height: 100%"
            }, vnode.attrs.action === "create" ? "Nouvelle partie" : "Rejoindre la partie")
        ])
};

const NewGameView = {
    view: () => m("p", "NewGameView")
};

const PlayView = {
    view: () => m("p", "PlayView")
};

const ErrorView = {
    view: vnode =>
        m("root", [
            m("p.text-danger", vnode.attrs.error),
            m(exitBtn)
        ])
};

const LoadingView = {
    view: () => m("loading.lds-dual-ring")
};
