"use strict";

import m from "mithril";

class DurationPicker {
    constructor(id) {
        // Duration in seconds
        this.hours = 2;
        this.minutes = 0;
        this.id = id;
    }

    get value() {
        return this.hours * 3600 + this.minutes * 60;
    }

    view() {
        return m("div", {id: this.id, class: "input-group input-group-sm", style: {width: "166px"}}, [
            m("div.input-group-prepend", m("span.input-group-text", "hh:mm")),
            m("input", {
                class: "form-control",
                type: "number",
                value: this.hours,
                min: 0,
                max: 99,
                step: 1,
                required: true,
                oninput: e => {
                    this.hours = e.target.value;
                }
            }),
            m("input", {
                class: "form-control",
                type: "number",
                value: this.minutes,
                min: 0,
                max: 59,
                step: 1,
                required: true,
                oninput: e => {
                    this.minutes = e.target.value;
                }
            })
        ]);
    }
}

export default DurationPicker;