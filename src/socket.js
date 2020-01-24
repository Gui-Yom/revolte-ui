export const WS = {
    socket: null,
    func: e => console.log("Unhandled msg !"),
    open: (url) => {
        this.socket = new WebSocket(url);
        this.socket.onmessage = e => this.func(e);
    },
    request: (msg, callback) => {
        this.func = callback;
        this.socket.send(msg);
    }
};