"use strict";

const API = {
    socket: null,
    buffer: new Map(),
    sep: "|",
    init: (url, viewerId) => {
        return new Promise((resolve, reject) => {
            if ('WebSocket' in window) {
                API.socket = new WebSocket(url + "?viewerId=" + viewerId);
                API.socket.onopen = resolve;
                API.socket.onerror = e => reject(e);
                API.socket.onmessage = e => {
                    const data = e.data.split(API.sep);
                    if (data[0] === "r") {
                        const isError = data[2] === "error";
                        API.buffer.get(data[1])[isError ? 1 : 0](isError ? data[3] : data.slice(2, data.length));
                    } else if (data[0] === "e") {
                        API.eventHandler(data.slice(1, data.length));
                    }
                };
            } else {
                reject("Websockets are not supported in this browser. :(");
            }
        });
    },
    request: msg => {
        return new Promise((resolve, reject) => {
            const id = generateId(6);
            API.buffer.set(id, [resolve, reject]);
            API.socket.send(id + API.sep + msg);
        });
    },
    eventHandler: data => {
    }
};

function dec2hex(dec) {
    return ('0' + dec.toString()).substr(-2);
}

// generateId :: Integer -> String
function generateId(len) {
    const arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
}

export default API;