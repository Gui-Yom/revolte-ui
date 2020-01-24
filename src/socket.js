export const WS = {
    socket: null,
    func: e => console.log("Unhandled msg !"),
    open: (url, onOpen, onError) => {
        this.socket = new WebSocket(url);
        this.socket.onopen = onOpen;
        this.socket.onerror = onError;
        this.socket.onmessage = e => this.func(e);
    },
    request: (msg, callback) => {
        this.func = callback;
        this.socket.send(msg);
    }
};