module.exports = {
	InvalidMessageFormatPrimitive: (function(){
		var exception = function(strJson) {
			this.code = 101;
			this.name = 'INVALID_MESSAGE_FORMAT_PRIMITIVE';
			this.message = ' Message format error. Primitive doesn\'t exist. ' + strJson;
		};
		exception.prototype = new Error();
		return exception;
	}()),

	InvalidMessageFormat: (function(){
		var exception = function(msg) {
			this.code = 102;
			this.name = 'INVALID_MESSAGE_FORMAT';
			this.message = msg;
		};
		exception.prototype = new Error();
		return exception;
	}()),

	InvalidHeaderFormat: (function(){
		var exception = function(msg) {
			this.code = 103;
			this.name = 'INVALID_HEADER_FORMAT';
			this.message = msg;
		};
		exception.prototype = new Error();
		return exception;
	}()),

	NoWebSocketException: (function(){
		var exception = function() {
			this.code = 200;
			this.name = 'NO_WEBSOCKET_EXCEPTION';
			this.message = 'There is no WebSocket available';
		};
		exception.prototype = new Error();
		return exception;
	}())
};
