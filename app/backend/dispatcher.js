const WebSocket = require('ws');
// Create a WebSocket server that will accept connections on port 3000.

const clients = [];


exports.createBackendDispatcher = function(server) {
	const wss = new WebSocket.Server({
		server
	});
// Listen for client connections.
wss.on('connection', function connection(ws) {
	//quand un client arrive on le stock dans le tableau et quand il part on l'enlève
	clients.push(ws);
console.log("client connected");
  // Listen for messages from the client once it has connected.
  ws.on('message', function incoming(message) {
  	console.log('received: %s', message);
  });

 ws.on('close', () => {
 	console.log("client leaving")
    clients.splice(clients.indexOf(ws),1)
    });

  // Send something to the client.

});

}

exports.notifyNewGuess = function(messageData){
	for(let clientws of clients){
		if (clientws) {
			clientws.send(messageData);
		}
	}
}