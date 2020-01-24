"use strict";

import m from "mithril";
import $ from "jquery"
import {exitBtn} from "./messenger";
import {WS} from "./socket"

import "../scss/main.scss"

const root = $("#app")[0];

export let apiHost;

window.mountApp = (threadId, viewerId, threadType, _apiHost) => {

    m.route(root, "/loading", {
        "/loading": LoadingView,
        "/start/:action": StartView,
        "/newgame": NewGameView,
        "/play": PlayView
    });

    if (viewerId == null) {
        showError("Impossible d'initialiser le contexte messenger: " + threadId)
    } else if (threadType !== "GROUP") {
        showError("Les parties de Révolté ne se joue que dans des conversations de groupe (min 9 joueurs)")
    } else {
        apiHost = _apiHost;
        state.threadid = threadId;
        state.viewerid = viewerId;
        state.threadType = threadType;

        WS.open("wss://" + apiHost + "/game");

        WS.request("game_exists?|" + threadId, e => {
            if (e.data === "true") {

                WS.request("game_info?|" + threadId, e => {
                    state.game = JSON.parse(e.data);
                    if (gameHasPlayer(viewerId))
                        m.route.set("/play");
                    else if (state.game.phase === "JOIN")
                        m.route.set("/start/:action", {action: "join"});
                });

            } else {
                m.route.set("/start/:action", {action: "create"});
            }
        });
    }
};

const state = {
    viewerid: null,
    threadid: null,
    threadType: null,
    game: null
};

function startAction(action) {
    if (action === "create") {
        m.route.set("/newgame");
    } else if (action === "join") {
        m.request({
            method: "POST",
            url: apiHost + "/game/:threadId/join",
            params: {threadId: state.threadid, playerId: state.viewerid},
            async: false
        }).then(data => {
            state.game.players.add(data);
            m.route.set("/play");
        }, err => {
            console.log(err);
        });

        WS.request("game_join!|" + state.threadid + "|" + state.viewerid, e => {
            if (e.data === "ok") {
                //state.game.players.add(data);
                m.route.set("/play");
            }
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

function showError(err) {
    m.mount(root, {
        view: () => m(ErrorView, {
            error: err
        })
    });
}

function gameHasPlayer(playerId) {
    for (const player of state.game.players) {
        if (player.playerId === playerId)
            return true;
    }
    return false;
}
