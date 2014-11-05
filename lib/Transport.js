module.exports = Transport;


/**
 * Dependencies.
 */
var EventEmitter = require('events').EventEmitter;
var MessageFactory = require('./MessageFactory');
var Exceptions = require('./Exceptions');
// 'ws' module uses the native WebSocket interface when bundled to run in a browser.
var WebSocket = require('ws');  // jshint ignore:line


function Transport(pMessageFactory, pWss) {
	EventEmitter.call(this);

	var self = this;

	try {
		this.webSocket = new WebSocket(pWss);

		this.webSocket.onopen = function() {
			self.emit("connected");
		};

		this.webSocket.onmessage = function(msg) {
			self.onReceive(msg);
		};

		this.webSocket.onclose = function() {
			self.emit("disconnected");
		};

		this.webSocket.onerror = function() {
			console.error("websocket error!");
		};

		this.messageFactory = pMessageFactory;
	}
	catch(err) {
		console.error(err);
		throw new Exceptions.NoWebSocketException();
	}
}

/**
 * Events:
 * - connected
 * - disconnected
 * - response
 * - notification
 */
Transport.prototype = new EventEmitter();

Transport.prototype.isWebSocketReady = function() {
	return this.webSocket && this.webSocket.readyState === this.webSocket.OPEN;
};

Transport.prototype.send = function(msg) {
	var message = JSON.stringify(msg);

	if(this.isWebSocketReady())	{
		this.webSocket.send(message);
	}
	else {
		throw new Exceptions.NoWebSocketException();
	}
};

Transport.prototype.onReceive = function(msg) {
	var json;

	try {
		json = JSON.parse(msg.data);
	}
	catch(e) {
		console.error("Transport.onReceive: received msg is not valid JSON");
		return;
	}

	try {
		this.messageFactory.isValidHeaderFormat(json);

		if(!this.messageFactory.isMine(json)) {
			return;
		}

		if(this.messageFactory.checkValidMessageFormat(json)) {
			// check if it's a Response or a Notification
			// transactionId <> 0 -> Response
			// transactionId == 0 -> Notification
			var transactionId = json[MessageFactory.C.HD_TRANSACTION_ID];
			// Notification
			if(transactionId === 0) {
				this.emit("onNotification", json);
			}
			// Response
			else {
				this.emit("onResponse", json);
			}
		}
	}
	catch(e) {
		throw e;
	}
};
