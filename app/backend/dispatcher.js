const WebSocket = require('ws');
// Create a WebSocket server that will accept connections on port 3000.
const wss = new WebSocket.Server({
  port: 3000
});
// Listen for client connections.
wss.on('connection', function connection(ws) {
  // Listen for messages from the client once it has connected.
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  // Send something to the client.
  ws.send('something');
});