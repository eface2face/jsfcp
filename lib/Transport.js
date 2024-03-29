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
var WebSocketWrapper = require('websocketwrapper');


function Transport(pMessageFactory, pWss) {
	debug('new | uri: %s', pWss);

	EventEmitter.call(this);

	var self = this;

	this.closed = false;  // true when close() is called.

	try {
		this.ws = new WebSocketWrapper(pWss);

		this.ws.onopen = function() {
			self.emit('connected');
		};

		this.ws.onreconnect = function() {
			self.emit('connected');
		};

		this.ws.onmessage = function(msg) {
			self.onReceive(msg);
		};

		this.ws.onclose = function() {
			self.emit('disconnected', self.closed);
		};

		this.ws.onerror = function() {
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
	return this.ws && this.ws.readyState === this.ws.OPEN;
};

Transport.prototype.send = function(msg) {
	var message = JSON.stringify(msg);

	if (this.isWebSocketReady())	{
		this.ws.send(message);
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
	try { this.ws.close(); } catch(error) {}
};
