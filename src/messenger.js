import m from "mithril";

export function exit() {
    MessengerExtensions.requestCloseBrowser(function success() {
    }, function error(err) {
        console.log(err)
    });
};

export let exitBtn = {
    view: () =>
        m("button", {
            onclick: exit,
            type: "button",
            class: "btn btn-secondary"
        }, "Exit")
};