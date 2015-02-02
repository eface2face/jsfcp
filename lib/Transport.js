module.exports = Transport;


/**
 * Dependencies.
 */
var debug = require('debug')('JsFCP:Transport');
var debugerror = require('debug')('JsFCP:ERROR:Transport');
debugerror.log = console.warn.bind(console);
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MessageFactory = require('./MessageFactory');
var Exceptions = require('./Exceptions');
// 'websocket' module uses the native WebSocket interface when bundled to run in a browser.
var WebSocket = require('websocket').w3cwebsocket;  // jshint ignore:line


function Transport(pMessageFactory, pWss) {
	debug('new | uri: %s', pWss);

	EventEmitter.call(this);

	var self = this;

	this.closed = false;  // true when close() is called.

	try {
		this.webSocket = new WebSocket(pWss);

		this.webSocket.onopen = function() {
			self.emit('connected');
		};

		this.webSocket.onmessage = function(msg) {
			self.onReceive(msg);
		};

		this.webSocket.onclose = function() {
			self.emit('disconnected', {local: self.closed});
		};

		this.webSocket.onerror = function() {
			debugerror('WebSocket error');
		};

		this.messageFactory = pMessageFactory;
	}
	catch(error) {
		debugerror('new | error thrown: %o', error);
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
util.inherits(Transport, EventEmitter);

Transport.prototype.isWebSocketReady = function() {
	return this.webSocket && this.webSocket.readyState === this.webSocket.OPEN;
};

Transport.prototype.send = function(msg) {
	var message = JSON.stringify(msg);

	if (this.isWebSocketReady())	{
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
		debug('onReceive() | received msg is not valid JSON');
		return;
	}

	debug('onReceive() | json: %o', json);

	try {
		this.messageFactory.isValidHeaderFormat(json);

		if (!this.messageFactory.isMine(json)) {
			return;
		}

		if(this.messageFactory.checkValidMessageFormat(json)) {
			// check if it's a Response or a Notification
			// transactionId <> 0 -> Response
			// transactionId == 0 -> Notification
			var transactionId = json[MessageFactory.C.HD_TRANSACTION_ID];
			// Notification
			if (transactionId === 0) {
				this.emit('notification', json);
			}
			// Response
			else {
				this.emit('response', json);
			}
		}
	}
	catch(e) {
		throw e;
	}
};


Transport.prototype.close = function() {
	this.closed = true;
	this.webSocket.close();
};
