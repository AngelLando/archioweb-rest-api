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
      clients.delete(ws);
    });

  // Send something to the client.
  ws.send('something');
});

}

exports.notifyNewGuess = function(){
	for(let clientws in clients){
		if (clientws) {
			clientws.send('New guess has been posted!');
		}
	}
	//dans la route ou on crée un guess, appeler cette fonction 
	//dans cette fonction , envoyer un message à tous les clients
}