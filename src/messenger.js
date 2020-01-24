import m from "mithril";

export function exit() {
    window.MessengerExtensions.requestCloseBrowser(function success() {
    }, function error(err) {
        console.log(err)
    });
};

export const exitBtn = {
    view: () =>
        m("button", {
            onclick: exit,
            type: "button",
            class: "btn btn-secondary"
        }, "Quitter")
};

export function sendMsg(msg) {

}