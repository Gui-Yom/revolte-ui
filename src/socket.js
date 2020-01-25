const WS = {
    socket: null,
    func: () => console.log("Unhandled msg !"),
    open: (url, onOpen, onError) => {
        if ('WebSocket' in window || 'MozWebSocket' in window) {
            WS.socket = new WebSocket(url);
            WS.socket.onopen = onOpen;
            WS.socket.onerror = onError;
            WS.socket.onmessage = e => WS.func(e);
        } else {
            onError("Websockets are not supported in this browser. :(");
        }
    },
    request: (msg, callback) => {
        WS.func = callback;
        WS.socket.send(msg);
    }
};

module.exports = WS;