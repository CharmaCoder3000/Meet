const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let waitingUser = null;

wss.on("connection", ws => {
    ws.on("message", message => {
        let data = JSON.parse(message);

        if (data.type === "join") {
            if (waitingUser) {
                // Pair the two users
                ws.send(JSON.stringify({ type: "match", peerId: waitingUser.peerId }));
                waitingUser.ws.send(JSON.stringify({ type: "match", peerId: data.peerId }));
                waitingUser = null; // Reset waiting user
            } else {
                // No one is waiting, so wait for the next user
                waitingUser = { ws, peerId: data.peerId };
            }
        }
    });

    ws.on("close", () => {
        if (waitingUser && waitingUser.ws === ws) {
            waitingUser = null; // Remove waiting user if they disconnect
        }
    });
});
