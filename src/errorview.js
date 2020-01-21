import m from "mithril";
import {exitBtn} from "./messenger";

export const ErrorView = {
    view: (vnode) =>
        m("root", [
            m("p", {class: "text-danger"}, vnode.attrs.error),
            m(exitBtn)
        ])
};