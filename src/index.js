"use strict";

import m from "mithril";
import $ from "jquery";
import "socket.io-client";

import MessengerExt from "./messenger";
import WS from "./socket";
import DurationPicker from "./duration-picker";

import "../scss/main.scss";

const root = document.body;

const state = {
    apiHost: "revolte.herokuapp.com",
    viewerId: null,
    threadId: null,
    threadType: null,
    game: null
};

function boot() {
    console.log(state.viewerId);
    console.log(state.threadId);
    if (!state.viewerId) {
        showError("Impossible d'initialiser le contexte messenger: " + state.threadId)
    } else if (state.threadType !== "GROUP") {
        showError("Les parties de Révolté ne se joue que dans des conversations de groupe (min 9 joueurs)")
    } else {
        WS.open("wss://" + state.apiHost + "/game", () => {
            WS.request("game_exists?|" + state.threadId, e => {
                if (e.data === "true") {
                    WS.request("game_info?|" + state.threadId, e => {
                        state.game = JSON.parse(e.data);
                        if (gameHasPlayer(state.viewerId))
                            m.route.set("/play");
                        else if (state.game.phase === "JOIN")
                            m.route.set("/start/:action", {action: "join"});
                    });
                } else {
                    m.route.set("/start/:action", {action: "create"});
                }
            });
        }, (e) => {
            showError("Unable to connect to websocket endpoint: " + e)
        });
    }
}

function startAction(action) {
    if (action === "create") {
        m.route.set("/newgame");
    } else if (action === "join") {
        WS.request("game_join!|" + state.threadId + "|" + state.viewerId, e => {
            if (e.data === "ok") {
                //state.game.players.add(data);
                m.route.set("/play");
            }
        });
    }
}

const StartView = {
    view: vnode =>
        m("div.d-flex.h-100.justify-content-center.align-items-center", [
            m("h1.display-4", "Révolté"),
            m("button.btn.btn-primary.btn-block.fixed-bottom", {
                onclick: () => startAction(vnode.attrs.action),
                style: {height: "10%"}
            }, vnode.attrs.action === "create" ? "Nouvelle partie" : "Rejoindre la partie")
        ])
};

const NewGameView = {
    pickerJoin: null,
    pickerNight: null,
    pickerDay: null,
    oninit: () => {
        NewGameView.pickerJoin = new DurationPicker("duration_join");
        NewGameView.pickerNight = new DurationPicker("duration_night");
        NewGameView.pickerDay = new DurationPicker("duration_day");
    },
    view: () => m("root", [
        m("h1#newgame-title.display-4.text-center", "Nouvelle partie"),
        m("div", {class: "container-fluid", style: {"max-width": "320px"}},
            m("form", {onsubmit: NewGameView.onsubmit}, [
                m("div.form-group", [
                    m("label[for=duration_join]", "Durée de la phase d'inscription"),
                    NewGameView.pickerJoin.view()
                ]),
                m("div.form-group", [
                    m("label[for=duration_night]", "Durée de la phase d'inscription"),
                    NewGameView.pickerNight.view()
                ]),
                m("div.form-group", [
                    m("label[for=duration_day]", "Durée de la phase d'inscription"),
                    NewGameView.pickerDay.view()
                ]),
                m("button.btn.btn-primary.btn-block.btn-sm[type=submit]", "Créer")
            ]))]),
    onsubmit: e => {
        e.preventDefault();
        console.log(NewGameView.pickerJoin.value);
        // TODO send websocket request with json
    }
};

const PlayView = {
    view: () => m("p", "PlayView : " + state.threadId)
};

const ErrorView = {
    view: vnode =>
        m("div", {
            role: "alert",
            class: "alert alert-danger"
        }, [
            m("h4.alert-heading", "Error"),
            m("span", [m("strong", vnode.attrs.error), m("br")]),
            m(exitBtn)
        ])
};

const LoadingView = {
    view: () => m("div.loading-div", m("div.loading"))
};

const exitBtn = {
    view: () =>
        m("button", {
            onclick: MessengerExt.exit,
            type: "button",
            class: "btn btn-danger btn-block btn-lg"
        }, "Quitter")
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
        if (player.hasOwnProperty(playerId))
            return true;
    }
    return false;
}

m.route(root, "/loading", {
    "/loading": LoadingView, // This view is only used during the initial connection with the backend
    "/start/:action": StartView,
    "/newgame": NewGameView,
    "/play": PlayView
});

if (NODE_ENV === "production")
    MessengerExt.load(PAGE_ID, (ctx) => {
        state.viewerId = ctx.psid;
        state.threadId = ctx.tid;
        state.threadType = ctx.thread_type;
        boot();
    });
else {
    state.viewerId = "69420";
    state.threadId = "123456789";
    state.threadType = "GROUP";
    boot();
}
