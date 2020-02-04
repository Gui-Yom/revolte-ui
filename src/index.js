"use strict";

import m from "mithril";

import MessengerExt from "./messenger";
import API from "./api";
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
        API.init("wss://" + state.apiHost + "/game", state.viewerId)
            .then(() => {
                API.request("gameExists?" + API.sep + state.threadId)
                    .then(response0 => {
                        if (response0[0] === "true") {
                            API.request("gameInfo?" + API.sep + state.threadId)
                                .then(response1 => {
                                    state.game = JSON.parse(response1[0]);
                                    if (gameHasPlayer(state.viewerId))
                                        m.route.set("/play");
                                    else if (state.game.phase === "JOIN")
                                        m.route.set("/start/:action", {action: "join"});
                                }, err => {
                                    showError(err);
                                });
                        } else {
                            m.route.set("/start/:action", {action: "create"});
                        }
                    }, err => {
                        showError(err);
                    });
            }, e => {
                showError("Unable to connect to websocket endpoint: " + e)
            });
        API.eventHandler = data => {
            switch (data[0]) {
                case "playerJoin!":
                    if (state.game == null) {
                        showError("wtf, received event out of nowhere");
                        break;
                    }
                    state.game.players[data[1]] = {
                        psid: data[1]
                    };
                    break;
            }
        }
    }
}

function startAction(action) {
    if (action === "create") {
        m.route.set("/newgame");
    } else if (action === "join") {
        API.request("joinGame!" + API.sep + state.threadId + API.sep + state.viewerId)
            .then(response => {
                if (response === "ok") {
                    m.route.set("/play");
                }
            }, err => {
                showError(err);
            });
    }
}

const StartView = {
    view: vnode =>
        m("root", [
            m("h1.display-4.text-center", {style: {"margin-top": "10px"}}, "Révolté"),
            m("button.btn.btn-primary.btn-block.fixed-bottom", {
                onclick: () => startAction(vnode.attrs.action),
                style: {height: "10%"}
            }, vnode.attrs.action === "create" ? "Nouvelle partie" : "Rejoindre la partie")
            // TODO afficher la liste des joueurs présents
        ])
};

const NewGameView = {
    pickerJoin: null,
    pickerNight: null,
    pickerDay: null,
    developerKey: "",
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
                m("div.form-group", [
                    m("label[for=developper_key]", "Clé développeur"),
                    m("input", {
                        id: "developper_key",
                        class: "form-control form-control-sm",
                        type: "password",
                        autocomplete: "off",
                        minLength: 5,
                        maxLength: 5,
                        required: true,
                        oninput: e => {
                            NewGameView.developerKey = e.target.value;
                        }
                    })
                ]),
                m("button.btn.btn-primary.btn-block.btn-sm[type=submit]", "Créer")
            ]))]),
    onsubmit: e => {
        e.preventDefault();
        console.log(NewGameView.pickerJoin.value);
        API.request("gameCreate!" + API.sep + JSON.stringify({
            threadId: state.threadId,
            phasesDuration: {
                JOIN: NewGameView.pickerJoin.value,
                NIGHT: NewGameView.pickerNight.value,
                DAY: NewGameView.pickerDay.value,
                NIGHT_END: 15
            },
            developerKey: NewGameView.developerKey
        })).then(response => {
            if (response[0] === "ok")
                m.route.set("/play");
        }, err => {
            showError(err);
        })
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
            m("h4.alert-heading", "Erreur"),
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

console.log(PAGE_ID);
if (NODE_ENV === "production")
    MessengerExt.load(PAGE_ID, (ctx) => {
        state.viewerId = ctx.psid;
        state.threadId = ctx.tid;
        state.threadType = ctx.thread_type;
        boot();
    }, (code, msg) => {
        showError("[" + code + "]: " + msg);
    });
else {
    state.viewerId = "69420";
    state.threadId = "123456789";
    state.threadType = "GROUP";
    boot();
}
