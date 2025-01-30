const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

// Create an HTTP server to serve the HTML file
const server = http.createServer((req, res) => {
    fs.readFile("index.html", (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end("Error loading HTML file");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
});

// Create a WebSocket server on the same HTTP server
const wss = new WebSocket.Server({ server });

let waitingUser = null;

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
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

// Start the server
server.listen(8080, () => {
    console.log("Server running on http://localhost:8080");
});
