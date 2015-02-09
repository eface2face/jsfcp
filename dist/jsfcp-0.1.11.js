/*
 * JsFCP v0.1.11
 * JavaScript BFCP client implementation using WebSocket as transport and JSON as message format
 * Copyright 2013-2015 eFace2Face, inc. All Rights Reserved
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.JsFCP=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
module.exports = FloorQuery;


/**
 * Dependencies.
 */
var debug = require('debug')('JsFCP:FloorQuery');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MessageFactory = require('./MessageFactory');


function FloorQuery(pArrayFloorIds) {
	EventEmitter.call(this);

	this.arrayFloorIds = pArrayFloorIds;
}

/**
 * Events
 * - floorGranted
 * - floorReleased
 */
util.inherits(FloorQuery, EventEmitter);


FloorQuery.prototype.onMessageReceived = function(json) {
	// onMessageReceived
	/*
	 * en el floorStatus solo hay un floor
	 * Si en alguno de los FloorRequestInformation hay un floorGranted, dejar de mirar y lanzar un
	 * onFloorGranted para ese floorId, userId
	 *
	 * si no, lanzo un onFloorReleased
	 *
	 */

	// Check it's a FloorStatus
	if(json[MessageFactory.C.HD_PRIMITIVE] === MessageFactory.C.PRI_FL_STATUS_NAM) {
		var floorStatus = json[MessageFactory.C.HD_ATTRIBUTES];

		var floorId = floorStatus[MessageFactory.C.ATT_FL_ID_NAM];
		// Check FloorRequestInformation exists
		if(floorStatus[MessageFactory.C.ATT_FLOOR_REQUEST_INFORMATION_NAM]) {
			var length, i, floorRequestInformation;
			length = floorStatus[MessageFactory.C.ATT_FLOOR_REQUEST_INFORMATION_NAM].length;

			for(i = 0; i < length; i++) {
				floorRequestInformation = floorStatus[MessageFactory.C.ATT_FLOOR_REQUEST_INFORMATION_NAM][i];

				if(floorRequestInformation[MessageFactory.C.ATT_OVERALL_REQUEST_STATUS_NAM]) {
					var floorRequestId = floorRequestInformation[MessageFactory.C.ATT_FL_REQUEST_ID_NAM];
					var requestStatus = floorRequestInformation[MessageFactory.C.ATT_OVERALL_REQUEST_STATUS_NAM][MessageFactory.C.ATT_REQUEST_STATUS_NAM];
					if(requestStatus && requestStatus[MessageFactory.C.ATT_REQUEST_STATUS_VALUE_NAM]) {
						var status = requestStatus[MessageFactory.C.ATT_REQUEST_STATUS_VALUE_NAM];
						if(floorRequestInformation[MessageFactory.C.ATT_BENEFICIARY_INFORMATION_NAM]) {
							var beneficiaryId = floorRequestInformation[MessageFactory.C.ATT_BENEFICIARY_INFORMATION_NAM][MessageFactory.C.ATT_BENEFICIARY_ID_NAM];

							if(status === MessageFactory.C.RS_GRANTED_NAM) {
									this.emit('floorGranted', {'floorId':floorId,'beneficiaryId':beneficiaryId, 'floorRequestId':floorRequestId});

							}
							else if(status === MessageFactory.C.RS_RELEASED_NAM ||
									status === MessageFactory.C.RS_REVOKED_NAM) {
								this.emit('floorReleased', {'floorId':floorId,'beneficiaryId':beneficiaryId, 'floorRequestId':floorRequestId});
							}
						}
					}
				}
			}
		}
	}
	else {
		debug('onMessageReceived(): FloorStatus was expected');
	}
	return null;
};

FloorQuery.prototype.onErrorReceived = function (error) {
	debug('onErrorReceived(): ' + error);
};

},{"./MessageFactory":6,"debug":14,"events":9,"util":13}],3:[function(require,module,exports){
module.exports = FloorRelease;


/**
 * Dependencies.
 */
var debug = require('debug')('JsFCP:FloorRelease');
var MessageFactory = require('./MessageFactory');


function FloorRelease(pEvents, pFloorRequestId, pBeneficiaryId){
	this.beneficiaryId = pBeneficiaryId;
	this.floorRequestId = pFloorRequestId;
	this.onError = pEvents.error;
}

FloorRelease.prototype.onMessageReceived = function(json) {
	debug('onMessageReceived(): this function shouldn\'t be called, but was called with: ' + json);
};

FloorRelease.prototype.onErrorReceived = function (error) {
	debug('onErrorReceived(): ', error);

	var errorCode = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_CODE_NAM];
	var errorInfo = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_INFO_NAM];

	if(this.onError !== undefined) {
		this.onError({'errorCode': errorCode, 'errorInfo': errorInfo});
	}
};

},{"./MessageFactory":6,"debug":14}],4:[function(require,module,exports){
module.exports = FloorRequest;


/**
 * Dependencies.
 */
var debug = require('debug')('JsFCP:FloorRequest');
var MessageFactory = require('./MessageFactory');


function FloorRequest(pEvents, pBeneficiaryId) {
	this.beneficiaryId = pBeneficiaryId;
	this.queuePosition = null;
	this.status = null;
	this.floorRequestId = null;
	this.statusInfo = null;

	this.onPending = pEvents.pending;
	this.onAccepted = pEvents.accepted;
	this.onGranted = pEvents.granted;
	this.onDenied = pEvents.denied;
	this.onCancelled = pEvents.cancelled;
	this.onReleased = pEvents.released;
	this.onRevoked = pEvents.revoked;
	this.onError = pEvents.error;
}

FloorRequest.prototype.onMessageReceived = function(json) {
	// Check it's a FloorRequestStatus
	if(json[MessageFactory.C.HD_PRIMITIVE] === MessageFactory.C.PRI_FL_REQUEST_STATUS_NAM) {
		var floorRequestInformation = json[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_FLOOR_REQUEST_INFORMATION_NAM];
		var statusInfo = json[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_STATUS_INFO_NAM];

		// Don't update if new status is lower than current status (it could be a 'lost' message)
		if(floorRequestInformation[MessageFactory.C.ATT_OVERALL_REQUEST_STATUS_NAM]) {
			var status = floorRequestInformation[MessageFactory.C.ATT_OVERALL_REQUEST_STATUS_NAM][MessageFactory.C.ATT_REQUEST_STATUS_NAM];
			if(status) {
				var newStatus = status[MessageFactory.C.ATT_REQUEST_STATUS_VALUE_NAM];
				if(newStatus) {
					if(isUpdateForStatus(newStatus, this.status)) {
						// check statusInfo
						if(statusInfo) {
							this.statusInfo = statusInfo;
						}
						// update status
						this.status = status[MessageFactory.C.ATT_REQUEST_STATUS_VALUE_NAM];
						// update queue position
						if(status[MessageFactory.C.ATT_QUEUE_POSITION_NAM]) {
							this.queuePosition = status[MessageFactory.C.ATT_QUEUE_POSITION_NAM];
						}
						// update floorRequestId
						this.floorRequestId = floorRequestInformation[MessageFactory.C.ATT_FL_REQUEST_ID_NAM];

						// EVENTS
						if(this.status === MessageFactory.C.RS_PENDING_NAM) {
							debug('onMessageReceived(): onPending ', this.floorRequestId);
							this.onPending(this);
							return true;
						}
						else if(this.status === MessageFactory.C.RS_ACCEPTED_NAM) {
							debug('onMessageReceived(): onAccepted ', this.floorRequestId);
							this.onAccepted(this);
							return true;
						}
						else if(this.status === MessageFactory.C.RS_GRANTED_NAM) {
							debug('onMessageReceived(): onGranted ', this.floorRequestId);
							this.onGranted(this);
							return true;
						}
						else if(this.status === MessageFactory.C.RS_DENIED_NAM) {
							debug('onMessageReceived(): onDenied ', this.floorRequestId);
							this.onDenied();
							return false;
						}
						else if(this.status === MessageFactory.C.RS_CANCELLED_NAM) {
							debug('onMessageReceived(): onCancelled ', this.floorRequestId);
							this.onCancelled();
							return false;
						}
						else if(this.status === MessageFactory.C.RS_RELEASED_NAM) {
							debug('onMessageReceived(): onReleased ', this.floorRequestId);
							this.onReleased();
							return false;
						}
						else if(this.status === MessageFactory.C.RS_REVOKED_NAM) {
							debug('onMessageReceived(): onRevoked ', this.floorRequestId);
							this.onRevoked();
							return false;
						}
					}
				}
			}
		}
	}
	else {
		debug('onMessageReceived(): FloorRequestStatus was expected');
	}
	return null;
};


FloorRequest.prototype.onErrorReceived = function(error) {
	debug('onErrorReceived(): ' + error);

	var errorCode = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_CODE_NAM];
	var errorInfo = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_INFO_NAM];

	if(this.onError !== undefined) {
		this.onError({'errorCode': errorCode, 'errorInfo': errorInfo});
	}
};

function isUpdateForStatus(newStatus, oldStatus) {
	if(newStatus === null) {
		return false;
	}
	if(oldStatus === null) {
		return true;
	}
	if(oldStatus === newStatus) {
		return false;
	}
	if(newStatus === MessageFactory.C.RS_GRANTED_NAM ||
		newStatus === MessageFactory.C.RS_DENIED_NAM ||
		newStatus === MessageFactory.C.RS_CANCELLED_NAM ||
		newStatus === MessageFactory.C.RS_RELEASED_NAM ||
		newStatus === MessageFactory.C.RS_REVOKED_NAM)
	{
		return true;
	}
	// newStatus is PENDING or ACCEPTED
	if(oldStatus === MessageFactory.C.RS_GRANTED_NAM) {
		return false;
	}
	if(oldStatus === MessageFactory.C.RS_PENDING_NAM && newStatus === MessageFactory.C.RS_ACCEPTED_NAM) {
		return true;

	}
	// newStatus is PENDING
	if(oldStatus === MessageFactory.C.RS_ACCEPTED_NAM) {
		return false;
	}
}

},{"./MessageFactory":6,"debug":14}],5:[function(require,module,exports){
var JsFCP = {
	/**
	 * Expose some subclasses.
	 */
	Participant: require('./Participant'),
	Exceptions: require('./Exceptions'),
	// Export the Node debug module.
	debug: require('debug')
};


module.exports = JsFCP;

},{"./Exceptions":1,"./Participant":7,"debug":14}],6:[function(require,module,exports){
module.exports = MessageFactory;


/**
 * Dependencies.
 */
var debug = require('debug')('JsFCP:MessageFactory');
var Exceptions = require('./Exceptions');


var C = {
	CNF_OPTIONAL : 'optional',
	CNF_MULTI : 'multiple',

	// JSON Message
	HD_VER : 'ver',// 1 for initial version
	HD_VER_1 : 1,
	HD_PRIMITIVE : 'primitive',// Main purpose
	HD_CONFERENCE_ID : 'conferenceId',
	HD_TRANSACTION_ID : 'transactionId',
	HD_USER_ID : 'userId',
	HD_HEADER : 'header',
	HD_ATTRIBUTES : 'attributes',

	// Primitives
	PRI_FL_REQUEST_NAM : 'FloorRequest',
	PRI_FL_REQUEST_VAL : 1,
	PRI_FL_RELEASE_NAM : 'FloorRelease',
	PRI_FL_RELEASE_VAL : 2,
	PRI_FL_REQUEST_QUERY_NAM : 'FloorRequestQuery',
	PRI_FL_REQUEST_QUERY_VAL : 3,
	PRI_FL_REQUEST_STATUS_NAM : 'FloorRequestStatus',
	PRI_FL_REQUEST_STATUS_VAL : 4,
	PRI_FL_USER_QUERY_NAM : 'UserQuery',
	PRI_FL_USER_QUERY_VAL : 5,
	PRI_FL_USER_STATUS_NAM : 'UserStatus',
	PRI_FL_USER_STATUS_VAL : 6,
	PRI_FL_QUERY_NAM : 'FloorQuery',
	PRI_FL_QUERY_VAL : 7,
	PRI_FL_STATUS_NAM : 'FloorStatus',
	PRI_FL_STATUS_VAL : 8,
	PRI_CH_ACTION_NAM : 'ChairAction',
	PRI_CH_ACTION_VAL : 9,
	PRI_CH_ACTION_ACK_NAM : 'ChairActionAck',
	PRI_CH_ACTION_ACK_VAL : 10,
	PRI_HELLO_NAM : 'Hello',
	PRI_HELLO_VAL : 11,
	PRI_HELLO_ACK_NAM : 'HelloAck',
	PRI_HELLO_ACK_VAL : 12,
	PRI_ERROR_NAM : 'Error',
	PRI_ERROR_VAL : 13,

	// Attributes
	ATT_BENEFICIARY_ID_NAM : 'beneficiaryId',
	ATT_BENEFICIARY_ID_VAL : 1,
	ATT_FL_ID_NAM : 'floorId',
	ATT_FL_ID_VAL : 2,
	ATT_FL_REQUEST_ID_NAM : 'floorRequestId',
	ATT_FL_REQUEST_ID_VAL : 3,
	ATT_PRIORITY_NAM : 'priority',
	ATT_PRIORITY_VAL : 4,
	ATT_REQUEST_STATUS_NAM : 'requestStatus',
	ATT_REQUEST_STATUS_VAL : 5,
	ATT_ERROR_CODE_NAM : 'errorCode',
	ATT_ERROR_CODE_VAL : 6,
	ATT_ERROR_INFO_NAM : 'errorInfo',
	ATT_ERROR_INFO_VAL : 7,
	ATT_PARTICIPANT_PROVIDED_INFO_NAM : 'participantProvidedInfo',
	ATT_PARTICIPANT_PROVIDED_INFO_VAL : 8,
	ATT_STATUS_INFO_NAM : 'statusInfo',
	ATT_STATUS_INFO_VAL : 9,
	ATT_SUPPORTED_ATTRIBUTES_NAM : 'supportedAttributes',
	ATT_SUPPORTED_ATTRIBUTES_VAL : 10,
	ATT_SUPPORTED_PRIMITIVES_NAM : 'supportedPrimitives',
	ATT_SUPPORTED_PRIMITIVES_VAL : 11,
	ATT_USER_DISPLAY_NAME_NAM : 'userDisplayName',
	ATT_USER_DISPLAY_NAME_VAL : 12,
	ATT_USER_URI_NAM : 'userUri',
	ATT_USER_URI_VAL : 13,
	ATT_BENEFICIARY_INFORMATION_NAM : 'beneficiaryInformation',
	ATT_BENEFICIARY_INFORMATION_VAL : 14,
	ATT_FLOOR_REQUEST_INFORMATION_NAM : 'floorRequestInformation',
	ATT_FLOOR_REQUEST_INFORMATION_VAL : 15,
	ATT_REQUESTED_BY_INFORMATION_NAM : 'requestedByInformation',
	ATT_REQUESTED_BY_INFORMATION_VAL : 16,
	ATT_FL_REQUEST_STATUS_NAM : 'floorRequestStatus',
	ATT_FL_REQUEST_STATUS_VAL : 17,
	ATT_OVERALL_REQUEST_STATUS_NAM : 'overallRequestStatus',
	ATT_OVERALL_REQUEST_STATUS_VAL : 18,
	ATT_REQUESTED_BY_ID_NAM : 'requestedById',
	ATT_REQUESTED_BY_ID_VAL : 19,
	ATT_EXTENSION_ATTRIBUTE_NAM : 'extensionAttribute',
	ATT_EXTENSION_ATTRIBUTE_VAL : 20,
	ATT_REQUEST_STATUS_VALUE_NAM : 'status',
	ATT_REQUEST_STATUS_VALUE_VAL : 21,
	ATT_QUEUE_POSITION_NAM : 'queuePosition',
	ATT_QUEUE_POSITION_VAL : 22,
	ATT_SUPPORTED_FLOORTYPES_NAM : 'supportedFloorTypes',
	ATT_SUPPORTED_FLOORTYPES_VAL : 23,

	// Priority
	PR_LOWEST_NAM : 'Lowest',
	PR_LOWEST_VAL : 0,
	PR_LOW_NAM : 'Low',
	PR_LOW_VAL : 1,
	PR_NORMAL_NAM : 'Normal',
	PR_NORMAL_VAL : 2,
	PR_HIGH_NAM : 'High',
	PR_HIGH_VAL : 3,
	PR_HIGHEST_NAM : 'Highest',
	PR_HIGHEST_VAL : 4,

	// Request Status
	RS_PENDING_NAM : 'Pending',
	RS_PENDING_VAL : 1,
	RS_ACCEPTED_NAM : 'Accepted',
	RS_ACCEPTED_VAL : 2,
	RS_GRANTED_NAM : 'Granted',
	RS_GRANTED_VAL : 3,
	RS_DENIED_NAM : 'Denied',
	RS_DENIED_VAL : 4,
	RS_CANCELLED_NAM : 'Cancelled',
	RS_CANCELLED_VAL : 5,
	RS_RELEASED_NAM : 'Released',
	RS_RELEASED_VAL : 6,
	RS_REVOKED_NAM : 'Revoked',
	RS_REVOKED_VAL : 7,

	// Error Code
	ERR_NO_CONF_NAM : 'ErrorConferenceDoesNotExist',
	ERR_NO_CONF_VAL : 1,
	ERR_NO_USER_NAM : 'UserDoesNotExist',
	ERR_NO_USER_VAL : 2,
	ERR_UNK_PR_NAM : 'UnknownPrimitive',
	ERR_UNK_PR_VAL : 3,
	ERR_UNK_ATT_NAM : 'UnknownMandatoryAttribute',
	ERR_UNK_ATT_VAL : 4,
	ERR_UNAUTH_OP_NAM : 'UnauthorizedOperation',
	ERR_UNAUTH_OP_VAL : 5,
	ERR_INV_FL_ID_NAM : 'InvalidFloorId',
	ERR_INV_FL_ID_VAL : 6,
	ERR_NO_FL_RQ_ID_NAM : 'FloorRequestIdDoesNotExist',
	ERR_NO_FL_RQ_ID_VAL : 7,
	ERR_MAX_FL_RQ_NAM : 'FloorRequestMaxNumberReached',
	ERR_MAX_FL_RQ_VAL : 8,
	ERR_TLS_NAM : 'UseTls',
	ERR_TLS_VAL : 9,
};

/**
 * Expose C object.
 */
MessageFactory.C = C;


var primitives = [
	C.PRI_FL_REQUEST_NAM,
	C.PRI_FL_RELEASE_NAM,
	C.PRI_FL_REQUEST_QUERY_NAM,
	C.PRI_FL_REQUEST_STATUS_NAM,
	C.PRI_FL_USER_QUERY_NAM,
	C.PRI_FL_USER_STATUS_NAM,
	C.PRI_FL_QUERY_NAM,
	C.PRI_FL_STATUS_NAM,
	C.PRI_CH_ACTION_NAM,
	C.PRI_CH_ACTION_ACK_NAM,
	C.PRI_HELLO_NAM,
	C.PRI_HELLO_ACK_NAM,
	C.PRI_ERROR_NAM
];

var priorityValues = [
	C.PR_LOWEST_NAM,
	C.PR_LOW_NAM,
	C.PR_NORMAL_NAM,
	C.PR_HIGH_NAM,
	C.PR_HIGHEST_NAM
];

var requestedStatusValues = [
	C.RS_PENDING_NAM,
	C.RS_ACCEPTED_NAM,
	C.RS_GRANTED_NAM,
	C.RS_DENIED_NAM,
	C.RS_CANCELLED_NAM,
	C.RS_RELEASED_NAM,
	C.RS_REVOKED_NAM
];

var errorValues = [
	C.ERR_NO_CONF_NAM,
	C.ERR_NO_USER_NAM,
	C.ERR_UNK_PR_NAM,
	C.ERR_UNK_ATT_NAM,
	C.ERR_UNAUTH_OP_NAM,
	C.ERR_INV_FL_ID_NAM,
	C.ERR_NO_FL_RQ_ID_NAM,
	C.ERR_MAX_FL_RQ_NAM,
	C.ERR_TLS_NAM
];


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//					GROUPED ATTRIBUTES CODE					//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

var groupedAtts = {};
groupedAtts[C.ATT_BENEFICIARY_INFORMATION_NAM] = [
	C.ATT_BENEFICIARY_ID_NAM,
	C.ATT_USER_DISPLAY_NAME_NAM,
	C.ATT_USER_URI_NAM,
	C.ATT_EXTENSION_ATTRIBUTE_NAM
];
groupedAtts[C.ATT_FLOOR_REQUEST_INFORMATION_NAM] = [
	C.ATT_FL_REQUEST_ID_NAM,
	C.ATT_OVERALL_REQUEST_STATUS_NAM,
	C.ATT_FL_REQUEST_STATUS_NAM,
	C.ATT_BENEFICIARY_INFORMATION_NAM,
	C.ATT_REQUESTED_BY_INFORMATION_NAM,
	C.ATT_PRIORITY_NAM,
	C.ATT_PARTICIPANT_PROVIDED_INFO_NAM,
	C.ATT_EXTENSION_ATTRIBUTE_NAM
];
groupedAtts[C.ATT_REQUESTED_BY_INFORMATION_NAM] = [
	C.ATT_REQUESTED_BY_ID_NAM,
	C.ATT_USER_DISPLAY_NAME_NAM,
	C.ATT_USER_URI_NAM,
	C.ATT_EXTENSION_ATTRIBUTE_NAM
];
groupedAtts[C.ATT_FL_REQUEST_STATUS_NAM] = [
	C.ATT_FL_ID_NAM,
	C.ATT_REQUEST_STATUS_NAM,
	C.ATT_STATUS_INFO_NAM,
	C.ATT_EXTENSION_ATTRIBUTE_NAM
];
groupedAtts[C.ATT_OVERALL_REQUEST_STATUS_NAM] = [
	C.ATT_FL_REQUEST_ID_NAM,
	C.ATT_REQUEST_STATUS_NAM,
	C.ATT_STATUS_INFO_NAM,
	C.ATT_EXTENSION_ATTRIBUTE_NAM
];
groupedAtts[C.ATT_REQUEST_STATUS_NAM] = [
	C.ATT_REQUEST_STATUS_VALUE_NAM,
	C.ATT_QUEUE_POSITION_NAM
];


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//						MESSAGE FORMAT						//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

var headerFormat = [C.HD_VER,C.HD_PRIMITIVE,C.HD_CONFERENCE_ID,C.HD_TRANSACTION_ID,C.HD_USER_ID, C.HD_ATTRIBUTES];

var format = {};

format[C.PRI_FL_REQUEST_NAM] = {};

format[C.PRI_FL_REQUEST_NAM][C.ATT_FL_ID_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_FL_ID_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_REQUEST_NAM][C.ATT_FL_ID_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_REQUEST_NAM][C.ATT_BENEFICIARY_ID_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_BENEFICIARY_ID_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_BENEFICIARY_ID_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_REQUEST_NAM][C.ATT_PARTICIPANT_PROVIDED_INFO_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_PARTICIPANT_PROVIDED_INFO_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_PARTICIPANT_PROVIDED_INFO_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_REQUEST_NAM][C.ATT_PRIORITY_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_PRIORITY_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_PRIORITY_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_REQUEST_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_REQUEST_NAM] = {};

format[C.PRI_FL_REQUEST_NAM][C.ATT_FL_ID_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_FL_ID_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_REQUEST_NAM][C.ATT_FL_ID_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_REQUEST_NAM][C.ATT_BENEFICIARY_ID_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_BENEFICIARY_ID_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_BENEFICIARY_ID_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_REQUEST_NAM][C.ATT_PARTICIPANT_PROVIDED_INFO_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_PARTICIPANT_PROVIDED_INFO_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_PARTICIPANT_PROVIDED_INFO_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_REQUEST_NAM][C.ATT_PRIORITY_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_PRIORITY_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_PRIORITY_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_REQUEST_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_REQUEST_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_RELEASE_NAM] = {};

format[C.PRI_FL_RELEASE_NAM][C.ATT_FL_REQUEST_ID_NAM] = {};
format[C.PRI_FL_RELEASE_NAM][C.ATT_FL_REQUEST_ID_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_RELEASE_NAM][C.ATT_FL_REQUEST_ID_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_RELEASE_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_RELEASE_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_RELEASE_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_REQUEST_QUERY_NAM] = {};

format[C.PRI_FL_REQUEST_QUERY_NAM][C.ATT_FL_REQUEST_ID_NAM] = {};
format[C.PRI_FL_REQUEST_QUERY_NAM][C.ATT_FL_REQUEST_ID_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_REQUEST_QUERY_NAM][C.ATT_FL_REQUEST_ID_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_REQUEST_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_REQUEST_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_REQUEST_STATUS_NAM] = {};

format[C.PRI_FL_REQUEST_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM] = {};
format[C.PRI_FL_REQUEST_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_REQUEST_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_MULTI] = 0;


format[C.PRI_FL_REQUEST_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_REQUEST_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_REQUEST_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_USER_QUERY_NAM] = {};

format[C.PRI_FL_USER_QUERY_NAM][C.ATT_BENEFICIARY_ID_NAM] = {};
format[C.PRI_FL_USER_QUERY_NAM][C.ATT_BENEFICIARY_ID_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_USER_QUERY_NAM][C.ATT_BENEFICIARY_ID_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_USER_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_USER_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_USER_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_USER_STATUS_NAM] = {};

format[C.PRI_FL_USER_STATUS_NAM][C.ATT_BENEFICIARY_INFORMATION_NAM] = {};
format[C.PRI_FL_USER_STATUS_NAM][C.ATT_BENEFICIARY_INFORMATION_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_USER_STATUS_NAM][C.ATT_BENEFICIARY_INFORMATION_NAM][C.CNF_MULTI] = 0;

format[C.PRI_FL_USER_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM] = {};
format[C.PRI_FL_USER_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_USER_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_USER_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_USER_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_USER_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_QUERY_NAM] = {};

format[C.PRI_FL_QUERY_NAM][C.ATT_FL_ID_NAM] = {};
format[C.PRI_FL_QUERY_NAM][C.ATT_FL_ID_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_QUERY_NAM][C.ATT_FL_ID_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_QUERY_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_STATUS_NAM] = {};

format[C.PRI_FL_STATUS_NAM][C.ATT_FL_ID_NAM] = {};
format[C.PRI_FL_STATUS_NAM][C.ATT_FL_ID_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_FL_STATUS_NAM][C.ATT_FL_ID_NAM][C.CNF_MULTI] = 0; // multi y protocol, single for us

format[C.PRI_FL_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM] = {};
format[C.PRI_FL_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_STATUS_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_MULTI] = 1;

format[C.PRI_FL_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_FL_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_FL_STATUS_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_CH_ACTION_NAM] = {};

format[C.PRI_CH_ACTION_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM] = {};
format[C.PRI_CH_ACTION_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_CH_ACTION_NAM][C.ATT_FLOOR_REQUEST_INFORMATION_NAM][C.CNF_MULTI] = 0;

format[C.PRI_HELLO_NAM] = {};

format[C.PRI_HELLO_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_HELLO_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_HELLO_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_CH_ACTION_ACK_NAM] = {};

format[C.PRI_CH_ACTION_ACK_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_CH_ACTION_ACK_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_CH_ACTION_ACK_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_HELLO_NAM] = {};

format[C.PRI_HELLO_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_HELLO_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_HELLO_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_HELLO_ACK_NAM] = {};

format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_PRIMITIVES_NAM] = {};
format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_PRIMITIVES_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_PRIMITIVES_NAM][C.CNF_MULTI] = 1;

format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_ATTRIBUTES_NAM] = {};
format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_ATTRIBUTES_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_ATTRIBUTES_NAM][C.CNF_MULTI] = 1;

format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_FLOORTYPES_NAM] = {};
format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_FLOORTYPES_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_HELLO_ACK_NAM][C.ATT_SUPPORTED_FLOORTYPES_NAM][C.CNF_MULTI] = 1;

format[C.PRI_HELLO_ACK_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_HELLO_ACK_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_HELLO_ACK_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;

format[C.PRI_ERROR_NAM] = {};
format[C.PRI_ERROR_NAM][C.ATT_ERROR_CODE_NAM] = {};
format[C.PRI_ERROR_NAM][C.ATT_ERROR_CODE_NAM][C.CNF_OPTIONAL] = 0;
format[C.PRI_ERROR_NAM][C.ATT_ERROR_CODE_NAM][C.CNF_MULTI] = 0;

format[C.PRI_ERROR_NAM][C.ATT_ERROR_INFO_NAM] = {};
format[C.PRI_ERROR_NAM][C.ATT_ERROR_INFO_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_ERROR_NAM][C.ATT_ERROR_INFO_NAM][C.CNF_MULTI] = 0;

format[C.PRI_ERROR_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM] = {};
format[C.PRI_ERROR_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_OPTIONAL] = 1;
format[C.PRI_ERROR_NAM][C.ATT_EXTENSION_ATTRIBUTE_NAM][C.CNF_MULTI] = 1;


function MessageFactory(pUserId, pConferenceId) {
	this.conferenceId = pConferenceId;
	this.userId = pUserId;
}

MessageFactory.prototype.getPriorityValues = function() {
	return priorityValues;
};

MessageFactory.prototype.getStatusValues = function() {
	return requestedStatusValues;
};

//Serialize json object and send to the server
MessageFactory.prototype.validatePacket = function(json) {
	try {
		this.isValidHeaderFormat(json);
		this.checkValidMessageFormat(json);
		return json;
	}
	catch(e) {
		debug('validatePacket(): invalid message format: ' + JSON.stringify(json));
		throw e;
	}
};

//----------------  MESSAGE OPERATIONS  --------------------------//
MessageFactory.prototype.createHeader = function(pPrimitive, pTransactionId)
{
	var packet = {};
	packet[C.HD_VER] = C.HD_VER_1;
	packet[C.HD_PRIMITIVE] = pPrimitive;
	packet[C.HD_TRANSACTION_ID] = pTransactionId;
	packet[C.HD_CONFERENCE_ID] = this.conferenceId;
	packet[C.HD_USER_ID] = this.userId;
	packet[C.HD_ATTRIBUTES] = {};
	return packet;
};

//Test if this message corresponds to this client
MessageFactory.prototype.isMine = function(jsonObject)
{
	// Check userId and conferenceId
	return (jsonObject[C.HD_USER_ID]===this.userId) &&
		(jsonObject[C.HD_CONFERENCE_ID]===this.conferenceId);
};

MessageFactory.prototype.isValidHeaderFormat = function(jsonObject) {
	var item, msg, i, length;

	length = Object.keys(jsonObject).length;
	for(i = 0; i < length; i++)	{
		item = headerFormat[i];
		if(jsonObject[item]=== undefined)
		{
			msg = 'isValidHeaderFormat(): ' + item + ' was not founded in header: ' + JSON.stringify(jsonObject);
			debug(msg);
			throw new Exceptions.InvalidHeaderFormat(msg);
		}
	}

	return true;
};

// Returns an array with founded errors
MessageFactory.prototype.checkValidMessageFormat = function(jsonObject) {
	var attributeList, value, item, msg;
	var errorList = [];
	var primitive = jsonObject[C.HD_PRIMITIVE];
	var str = JSON.stringify(jsonObject);

	// Check if primitive is correct
	if(primitives.indexOf(primitive)<0) {
		msg = 'checkValidMessageFormat(): message format error, primitive "' + primitive + '" doesn\'t belong to primitives list: ' + str;
		debug(msg);
		throw new Exceptions.InvalidMessageFormatPrimitive(msg);
	}

	var standard_primitive = format[primitive];
	attributeList = jsonObject[C.HD_ATTRIBUTES];

	for (var attr in standard_primitive) {
		// Is a mandatory attribute
		if(!standard_primitive[attr][C.CNF_OPTIONAL]) {
			if(!attributeList[attr])
			{
				msg = 'checkValidMessageFormat(): message format error, no attribute ' + attr + ': ' + JSON.stringify(jsonObject);
				debug(msg);
				errorList.push(msg);
			}
		}
	}

	// Check if the att which doesn't belong to header has the correct format
	for (attr in attributeList) {
		if(headerFormat.indexOf(attr) < 0) {
			// The attr should no be in that msg
			if(!standard_primitive[attr]) {
				msg = 'checkValidMessageFormat(): message format error, attribute ' + attr + ' doesn\'t belong to ' +
					primitive + ' specification: '  + JSON.stringify(jsonObject);
				debug(msg);
				errorList.push(msg);
			}
			else { // Check the format multi/single is correct
				value = attributeList[attr];
				if(value instanceof Array) {
					if(!standard_primitive[attr][C.CNF_MULTI]) {
						msg = 'checkValidMessageFormat(): message format error, value of ' + attr +
						' doesn\'t fit with the format for ' + primitive +
						'(value type shouldn\'t be an array): ' + JSON.stringify(jsonObject);
						debug(msg);
						errorList.push(msg);
					}
					// Check if its children has the correct format
					else {
						var length = value.length;

						for(var i = 0; i < length; i++) {
							item = value[i];
							errorList = checkJsfcpAttributeFormat(attr,item, errorList);
						}
					}
				}
				else {
					if (standard_primitive[attr][C.CNF_MULTI]) {
						msg = 'checkValidMessageFormat(): message format error, value of ' + attr +
						' doesn\'t fit with the format for ' + primitive +
						'(value type should be an array): ' + JSON.stringify(jsonObject);
						debug(msg);
						errorList.push(msg);
					}
					// Check if its children has the correct format
					else {
						errorList = checkJsfcpAttributeFormat(attr, value, errorList);
					}
				}
			}
		}
	}

	msg = 'checkValidMessageFormat(): these errors were founded in JSON message: ' + str;
	for(var j = 0; j < errorList.length; j++) {
		msg += '\n- ' + errorList[j];
	}
	if(j>0) {
		debug(msg);
		throw new Exceptions.InvalidMessageFormat(msg);
	}

	return true;
};

//Check if jsonObject has the correct json format in order to
//be included in a JsFCP Packet
function checkJsfcpAttributeFormat(attribute,value, pErrorList) {
	//attributeList = new Array();
	var index, msg, length;
	var attributeList = [];
	var errorList = pErrorList;

	if(isGroupedAttribute(attribute)) {
		attributeList = iterateJSONAtts(value);
		length = errorList.length;

		errorList = checkValidAttributes(attributeList, groupedAtts[attribute], errorList);

		// If attributeList is not correct it makes no sense to continue
		// checking attributes content
		if( errorList.length !== length) {
			return errorList;
		}
	}

	switch(attribute) {
		case C.ATT_PRIORITY_NAM:
			// Checks the value is correct. Value is a text
			if(!isValidPriorityValue(value)) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' + C.ATT_PRIORITY_NAM +
					', "' + value + '" is not a valid value';
				debug(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_REQUEST_STATUS_NAM:
			// Checks the value is correct. Value is a JSON object
			var status = value[C.ATT_REQUEST_STATUS_VALUE_NAM];
			if(!status || status === 'undefined') {
				msg = 'checkJsfcpAttributeFormat(): attribute ' + C.ATT_REQUEST_STATUS_NAM +
					', ' + C.ATT_REQUEST_STATUS_VALUE_NAM + ' was found';
				debug(msg);
				errorList.push(msg);
			}
			if(!isValidRequestedStatusValue(status)) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' +  C.ATT_REQUEST_STATUS_NAM +
				', "' + status + '" is not a valid value';
				debug(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_ERROR_CODE_NAM:
			// Checks the value is correct. Value is a text
			if(!isValidErrorValue(value)) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' + C.ATT_ERROR_CODE_NAM +
					', "' + value + '" is not a valid value for attribute ' +
					C.ATT_ERROR_CODE_NAM;
				debug(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_FLOOR_REQUEST_INFORMATION_NAM:
			index = attributeList.indexOf(C.ATT_FL_REQUEST_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = 'checkJsfcpAttributeFormat(): Attribute ' +
					C.ATT_FLOOR_REQUEST_INFORMATION_NAM +
					', no ' + C.ATT_FL_REQUEST_ID_NAM + ' was found';
				debug(msg);
				errorList.push(msg);
			}
			// Checks C.ATT_FL_REQUEST_STATUS_NAM exists
			if(attributeList.indexOf(C.ATT_FL_REQUEST_STATUS_NAM)<0) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' +
					C.ATT_FLOOR_REQUEST_INFORMATION_NAM +
					', no ' + C.ATT_FL_REQUEST_STATUS_NAM + ' was found';
				debug(msg);
				errorList.push(msg);
			}
			else {
				// Checks C.ATT_FL_REQUEST_STATUS_NAM is an Array
				if(!(value[C.ATT_FL_REQUEST_STATUS_NAM] instanceof Array)) {
					msg = 'checkJsfcpAttributeFormat(): attribute ' +
						C.ATT_FLOOR_REQUEST_INFORMATION_NAM + ', ' +
						C.ATT_FL_REQUEST_STATUS_NAM +
						' should be an array';
					debug(msg);
					errorList.push(msg);
				}
			}
			break;

		case C.ATT_OVERALL_REQUEST_STATUS_NAM:
			index = attributeList.indexOf(C.ATT_FL_REQUEST_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' +
					C.ATT_OVERALL_REQUEST_STATUS_NAM +
					', no ' + C.ATT_FL_REQUEST_ID_NAM + ' was found';
				debug(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_FL_REQUEST_STATUS_NAM:
			index = attributeList.indexOf(C.ATT_FL_ID_NAM);
			// Checks C.ATT_FL_ID_NAM exists
			if( index < 0) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' +
					C.ATT_FL_REQUEST_STATUS_NAM +
					', no ' + C.ATT_FL_ID_NAM + ' was found';
				debug(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_BENEFICIARY_INFORMATION_NAM:
			index = attributeList.indexOf(C.ATT_BENEFICIARY_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' +
					C.ATT_BENEFICIARY_INFORMATION_NAM +
					', no ' + C.ATT_BENEFICIARY_ID_NAM + ' was found';
				debug(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_REQUESTED_BY_INFORMATION_NAM:
			index = attributeList.indexOf(C.ATT_REQUESTED_BY_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = 'checkJsfcpAttributeFormat(): attribute ' +
					C.ATT_REQUESTED_BY_INFORMATION_NAM +
					', no ' + C.ATT_REQUESTED_BY_ID_NAM + ' was found';
				debug(msg);
				errorList.push(msg);
			}
			break;
		default:
	}

	// Check children if grouped attributes
	length  = errorList.length;
	attributeList.forEach(function(item){
		if(isGroupedAttribute(item)|| item === C.ATT_PRIORITY_NAM) {
			if(value[item] instanceof Array) {
				var len = value[item].length;
				for(var i = 0; i < len; i++) {
					errorList = checkJsfcpAttributeFormat(item,value[item][i], errorList);
				}
			}
			else {
				errorList = checkJsfcpAttributeFormat(item,value[item], errorList);
				if(errorList.length !== length) {
					return errorList;
				}
			}
		}
	});

	return errorList;
}

function checkValidAttributes(pAttList, pValidList, pErrorList) {
	var length = pAttList.length;
	var errorList = pErrorList;
	var msg;

	for (var i = 0; i < length; i++) {
		var index = pValidList.indexOf(pAttList[i]);
		if(index < 0) {
			msg = 'checkValidAttributes(): attribute list [' +  pAttList +
				'], invalid attribute list because of [' + pAttList[i] + ']';
			debug(msg);
			errorList.push(msg);
		}
	}

	return errorList;
}

function iterateJSONAtts(jsonObject) {
	var result = [];

	for (var val in jsonObject) {
		result.push(val);
	}
	return result;
}

function isGroupedAttribute(att) {
	if(groupedAtts[att]) {
		return true;
	}
	return false;
}

function isValidPriorityValue(value) {
	if(priorityValues.indexOf(value) >= 0) {
		return true;
	}
	return false;
}

function isValidRequestedStatusValue(value) {
	if(requestedStatusValues.indexOf(value) >= 0) {
		return true;
	}
	return false;
}

function isValidErrorValue(value) {
	if(errorValues.indexOf(value) >= 0) {
		return true;
	}
	return false;
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//							OPERATIONS						//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

//++++++++++++++ Floor participant operations  +++++++++++++//

//Requesting a Floor
//It sends a FloorRequest message to the floor control server
//- Floor participant sets ConferenceID and TransactionID
//- Floor participant sets the UserID
//- If the beneficiary of the floor is not the UserID, the sender SHOULD add a
//BeneficiaryID att
//- It Uses FloorRequest Primitive
//- Floor participant must set at least on FloorId
//- Floor participant MAY set Participant-Provided-Info (Reason)
//- Floor participant MAY set Priority
MessageFactory.prototype.createRequestFloor = function(pTransactionID, pArrayFloorIds,
	pBeneficiaryId,
	pPriority,
	pParticipantProvidedInfo)
{
	var packet = this.createHeader(C.PRI_FL_REQUEST_NAM, pTransactionID);

	packet[C.HD_ATTRIBUTES][C.ATT_FL_ID_NAM]= pArrayFloorIds;

	if(pBeneficiaryId && pBeneficiaryId !== this.userId) {
		packet[C.HD_ATTRIBUTES][C.ATT_BENEFICIARY_ID_NAM] = pBeneficiaryId;
	}

	if(pPriority) {
		packet[C.HD_ATTRIBUTES][C.ATT_PRIORITY_NAM] = pPriority;
	}

	if(pParticipantProvidedInfo) {
		packet[C.HD_ATTRIBUTES][C.ATT_PARTICIPANT_PROVIDED_INFO_NAM] = pParticipantProvidedInfo;
	}

	return this.validatePacket(packet);
};

//Cancelling a Floor Request (and releasing the floor/floors)
//- Floor participant sets ConferenceID and TransactionID
//- Floor participant sets UserID
//- It Uses FloorRelease Primitive
//- Floor participant must set at least on FloorId
MessageFactory.prototype.createReleaseFloor = function(pTransactionID, pFloorRequestId) {
	var packet = this.createHeader(C.PRI_FL_RELEASE_NAM, pTransactionID);

	packet[C.HD_ATTRIBUTES][C.ATT_FL_REQUEST_ID_NAM]=pFloorRequestId;

	return this.validatePacket(packet);
};



//++++++++++++++++ Chair operations  +++++++++++++++++//

//Floor chairs can instruct the floor control server in order
//to grant or revoke a floor/floors
//- pObjFloorRequestInformation is a JSON Object
//- Floor chair sets ConferenceID and TransactionID
//- Floor chair sets the User ID in the common header to the floor participant's identifier.
//- It Uses ChairAction Primitive
//- Floor chair sets FLOOR-REQUEST-INFORMATION
//- Floor chair sets at least one FLOOR-REQUEST-STATUS
MessageFactory.prototype.createChairAction = function(pTransactionID, pObjFloorRequestInformation) {
	var packet = this.createHeader(C.PRI_CH_ACTION_NAM, pTransactionID);

	packet[C.HD_ATTRIBUTES][C.ATT_FLOOR_REQUEST_INFORMATION_NAM]= pObjFloorRequestInformation;

	return this.validatePacket(packet);
};


//+++++++  General client (Floor participant/Floor chair) operations  +++++++++//

//Ask for information about the status of a floor/floors
//- Client sets ConferenceID and TransactionID
//- Client sets the UserID
//- It Uses FloorQuery Primitive
//- Client participant asks for periodic information about passed FloodIds
//    If the client does not want to receive information about any floor any
//    longer, it sends a FloorQuery message with no FLOOR-IDattribute.
MessageFactory.prototype.createQueryFloor = function(pTransactionID, pArrayFloorIds) {
	var packet = this.createHeader(C.PRI_FL_QUERY_NAM, pTransactionID);

	packet[C.HD_ATTRIBUTES][C.ATT_FL_ID_NAM]=  pArrayFloorIds;

	return this.validatePacket(packet);
};


//A Client can ask for information about the current status of a floor request
//- Client sets ConferenceID and TransactionID
//- Client sets the UserID
//- It Uses FloorRequestQuery Primitive
//- Client MUST insert a FLOOR-REQUEST-ID att
MessageFactory.prototype.createQueryFloorRequest = function(pTransactionID, pFloorRequestId) {
	var packet = this.createHeader(C.PRI_FL_REQUEST_QUERY_NAM, pTransactionID);

	packet[C.HD_ATTRIBUTES][C.ATT_FL_REQUEST_ID_NAM]= pFloorRequestId;

	return this.validatePacket(packet);
};


//A client can ask for information about a participant and the floor
//request related to his participant
//- Client sets ConferenceID and TransactionID
//- Client sets the UserID
//- It Uses UserQuery Primitive
//- Client MUST insert a BENEFICIARY-ID att when requesting information about another client
//- If there's no BENEFICIARY-ID att, client is requesting information about himself
MessageFactory.prototype.createQueryUser = function(pTransactionID, pBeneficiaryId) {
	var packet = this.createHeader(C.PRI_FL_USER_QUERY_NAM, pTransactionID);

	if(pBeneficiaryId) {
		packet[C.HD_ATTRIBUTES][C.ATT_BENEFICIARY_ID_NAM]= pBeneficiaryId;
	}

	return this.validatePacket(packet);
};


//A client that wishes to obtain capabilities of a floor control server
//does so by sending a Hello message to the floor conetrol server
//- Client sets ConferenceID and TransactionID
//- Client sets the UserID
//- 7It Uses Hello Primitive
MessageFactory.prototype.createHello = function (pTransactionID) {
	var packet = this.createHeader(C.PRI_HELLO_NAM, pTransactionID);

	return this.validatePacket(packet);
};

},{"./Exceptions":1,"debug":14}],7:[function(require,module,exports){
module.exports = Participant;


/**
 * Dependencies.
 */
var debug = require('debug')('JsFCP:Participant');
var debugerror = require('debug')('JsFCP:ERROR:Participant');
debugerror.log = console.warn.bind(console);
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MessageFactory = require('./MessageFactory');
var Transport = require('./Transport');
var FloorRequest = require('./FloorRequest');
var FloorRelease = require('./FloorRelease');
var FloorQuery = require('./FloorQuery');


function Participant(pConferenceId, pUserId, pWss, pFloors) {
	EventEmitter.call(this);

	var self = this;

	this.userId = pUserId;
	this.conferenceId = pConferenceId;
	this.floorList = pFloors;
	this.transactionMap = {}; // key: transactionId, value: RequestFloor
	this.floorRequestMap = {}; // key: floorRequestId, value: RequestFloor
	this.floorQuery = null;
	this.messageFactory = new MessageFactory(this.userId, this.conferenceId);
	this.transport = new Transport(this.messageFactory, pWss);
	this.closed = false;  // true when close() is called.

	this.transport.on('connected', function() {
		self.queryFloor(pFloors);
		self.emit('connected');
	});

	this.transport.on('reconnect', function() {
		self.queryFloor(pFloors);
		self.emit('connected');
	});

	this.transport.on('disconnected', function(local) {
		self.emit('disconnected', local);
	});

	this.transport.on('response', function(json) {
		self.manageResponse(json);
	});

	this.transport.on('notification', function(json) {
		self.manageNotification(json);
	});
}

/**
 * Events:
 * - connected
 * - disconnected
 * - floorGranted
 * - floorReleased
 */
 util.inherits(Participant, EventEmitter);

// TODO: Remove this function.
Participant.prototype.isWebSocketReady = function() {
	return this.transport.isWebSocketReady();
};

Participant.prototype.manageResponse = function(json) {
	// Check transactionId
	var transactionId = json[MessageFactory.C.HD_TRANSACTION_ID];

	// If transactionId is key in transactionMap, get FloorRequest, remove it
	// from transactionMap and add it to requestedFloors
	if(this.transactionMap.hasOwnProperty(transactionId))
	{
		var floorObj = this.transactionMap[transactionId];
		delete this.transactionMap[transactionId];
		var primitive = json[MessageFactory.C.HD_PRIMITIVE];

		if(primitive === MessageFactory.C.PRI_ERROR_NAM) {
			floorObj.onErrorReceived(json);
		}
		else {
			// Check type of the object
			if(floorObj instanceof  FloorRequest) {
				if(floorObj.onMessageReceived(json)===true) {
					this.floorRequestMap[floorObj.floorRequestId] = floorObj;
				}
			}
			else if (floorObj instanceof  FloorRelease) {
				if(this.floorRequestMap.hasOwnProperty(floorObj.floorRequestId)) {
					this.manageNotification(json);
				}
			}
			else if (floorObj instanceof  FloorQuery) {
				floorObj.onMessageReceived(json);
			}
			else {
				debug('manageResponse(): FloorRequest/FloorRelease was expected');
			}
		}
	}
	else {
		// We were not waiting for that response. Ignore
		debug('manageResponse(): not a response, ignored');
	}
};

Participant.prototype.manageNotification = function(json) {
	var primitive = json[MessageFactory.C.HD_PRIMITIVE];

	// It should be: FloorRequestStatus, FloorStatus or HelloAck
	if(primitive === MessageFactory.C.PRI_FL_REQUEST_STATUS_NAM) {
		// Sended Primitive: floorRequestStatus
		// - buscar en el mapa de floorRequest el floorRequestId
		// - si lo hay:
		// 		-- llamar a onMessageReceived
		// 			-- si es false, quitarlo de la lista
		var floorRequestId = json[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_FLOOR_REQUEST_INFORMATION_NAM][MessageFactory.C.ATT_FL_REQUEST_ID_NAM];
		if(this.floorRequestMap.hasOwnProperty(floorRequestId)) {
			var floorRequest = this.floorRequestMap[floorRequestId];
			// if Floor has been denied, cancelled, released or revoked
			if(floorRequest.onMessageReceived(json) === false) {
				delete this.floorRequestMap[floorRequestId];
			}
		}
	}
	else if(primitive === MessageFactory.C.PRI_FL_STATUS_NAM) {
		// Sended Primitive: floorQuery
		if(this.floorQuery) {
			this.floorQuery.onMessageReceived(json);
		}
	}
	// else if(primitive === MessageFactory.C.PRI_HELLO_ACK_NAM) {
		// Sent Primitive: hello
	// }
};

Participant.prototype.requestFloor = function(events,
	pArrayFloorIds,
	pBeneficiaryId,
	pPriority,
	pParticipantProvidedInfo)
{
	debug('requestFloor() | floorIds: %o', pArrayFloorIds);

	if(!Array.isArray(pArrayFloorIds) || pArrayFloorIds.length === 0) {
		throw new TypeError('pArrayFloorIds must be an array with at least one element');
	}

	var transactionId = Math.floor(Math.random() * 10000);
	if(!pBeneficiaryId) {
		pBeneficiaryId = this.userId;
	}
	var floorRequest = new FloorRequest(events, pBeneficiaryId);
	this.transactionMap[transactionId] = floorRequest;
	var jsonMsg = this.messageFactory.createRequestFloor(transactionId,
			pArrayFloorIds,
			pBeneficiaryId,
			pPriority,
			pParticipantProvidedInfo);
	this.transport.send(jsonMsg);
	return floorRequest;
};

Participant.prototype.release = function(events, floorRequest) {
	debug('release() | floorRequest: %o', floorRequest);

	var floorRequestId = null;

	if(floorRequest instanceof FloorRequest) {
		floorRequestId = floorRequest.floorRequestId;
	}
	else {  // floorRequestId
		floorRequestId = parseInt(floorRequest);
	}

	if((floorRequestId !== null) && (floorRequestId !== Number.NaN)) {
		var transactionId = Math.floor(Math.random() * 10000);
		var floorRelease = new FloorRelease(events, floorRequestId, this.userId);
		this.transactionMap[transactionId] = floorRelease;
		var jsonMsg = this.messageFactory.createReleaseFloor(transactionId,
			floorRequestId);
		this.transport.send(jsonMsg);
	}
	// else {
		// TODO: Throw exception informing there's no floor with that type  CARMEN
	// }
};

Participant.prototype.queryFloor = function(pArrayFloorIds) {
	debug('queryFloor() | floorIds: %o', pArrayFloorIds);

	var self = this;

	if(pArrayFloorIds.length > 0) {
		var transactionId = Math.floor(Math.random() * 10000);
		var floorQuery = new FloorQuery(pArrayFloorIds);
		this.transactionMap[transactionId] = floorQuery;
		this.floorQuery = floorQuery;

		floorQuery.on('floorGranted', function(data)	{
			self.emit('floorGranted', data);
		});

		floorQuery.on('floorReleased', function(data) {
			self.emit( 'floorReleased', data);
		});

		var jsonMsg = this.messageFactory.createQueryFloor(transactionId,
			pArrayFloorIds);
		this.transport.send(jsonMsg);
	}
	// else {
		// TODO: Throw exception informing there's no floor with that type  CARMEN
	// }
};


Participant.prototype.close = function() {
	debug('close()');

	if (this.closed) { return; }

	this.transport.close();
};

},{"./FloorQuery":2,"./FloorRelease":3,"./FloorRequest":4,"./MessageFactory":6,"./Transport":8,"debug":14,"events":9,"util":13}],8:[function(require,module,exports){
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

},{"./Exceptions":1,"./MessageFactory":6,"debug":14,"events":9,"util":13,"websocketwrapper":17}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],11:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],13:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":12,"_process":11,"inherits":10}],14:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = window.localStorage;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":15}],15:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":16}],16:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],17:[function(require,module,exports){
/**
 * Expose the WebSocketWrapper class.
 */
module.exports = WebSocketWrapper;


/**
 * Dependencies.
 */
var debug = require('debug')('WebSocketWrapper');
var debugerror = require('debug')('WebSocketWrapper:ERROR');
debugerror.log = console.warn.bind(console);
// 'websocket' module uses the native WebSocket interface when bundled to run in a browser.
var W3CWebSocket = require('websocket').w3cwebsocket;


function WebSocketWrapper(url, protocols, origin, headers, requestOptions, clientConfig) {
	debug('new() | [url:%s, protocols:%s]', url, protocols);

	var self = this;

	// Create the native WebSocket instance.
	this.createWebSocket = function() {
		this.ws = new W3CWebSocket(url, protocols, origin, headers, requestOptions, clientConfig);

		this.ws.onopen = function(e) {
			_onopen.call(self, e);
		};

		this.ws.onerror = function(e) {
			_onerror.call(self, e);
		};

		this.ws.onclose = function(e) {
			_onclose.call(self, e);
		};

		if (this._onmessage) {
			this.ws.onmessage = this._onmessage;
		}

		if (this._binaryType) {
			this.ws.binaryType = this._binaryType;
		}
	};

	this.createWebSocket();

	// Flag indicating that WebSocket is closed by us.
	this.closed = false;

	// Flag indicating that an error happened while connecting.
	this.hasError = false;

	// Reconnecting flag.
	this.isReconnecting = false;

	// Reconnection timer.
	this.reconnectionTimer = null;

	// Reconnection delay.
	this.reconnectionDelay = 2000;
}


// Expose W3C WebSocket attributes.
Object.defineProperties(WebSocketWrapper.prototype, {
    url:            { get: function() { return this.ws.url;            } },
    readyState:     { get: function() { return this.ws.readyState;     } },
    protocol:       { get: function() { return this.ws.protocol;       } },
    extensions:     { get: function() { return this.ws.extensions;     } },
    bufferedAmount: { get: function() { return this.ws.bufferedAmount; } },

    CONNECTING:     { get: function() { return this.ws.CONNECTING;     } },
    OPEN:           { get: function() { return this.ws.OPEN;           } },
    CLOSING:        { get: function() { return this.ws.CLOSING;        } },
    CLOSED:         { get: function() { return this.ws.CLOSED;         } },

    // TODO: set when reconnected
    binaryType: {
        get: function() {
            return this.ws.binaryType;
        },
        set: function(type) {
        	this._binaryType = type;
            this.ws.binaryType = type;
        }
    },

    onmessage: {
    	get: function() {
    		return this.ws.onmessage;
    	},
    	set: function(handler) {
    		this._onmessage = handler;
    		this.ws.onmessage = handler;
    	}
    }
});


/**
 * Public API.
 */


WebSocketWrapper.prototype.send = function(data) {
	this.ws.send(data);
};


WebSocketWrapper.prototype.close = function(code, reason) {
	debug('close() | [code:%s, reason:%s]', code, reason);

	if (this.closed) { return; }
	this.closed = true;

	// Reset events.
	this.onopen = null;
	this.onerror = null;
	this.onmessage = null;

	// Stop the reconnection timer.
	clearTimeout(this.reconnectionTimer);

	if (this.ws.readyState === this.ws.CONNECTING || this.ws.readyState === this.ws.OPEN) {
		this.ws.close(code, reason);
	}
};


WebSocketWrapper.prototype.setReconnectionDelay = function(delay) {
	this.reconnectionDelay = delay;
};


/**
 * Private API.
 */


function _onopen(e) {
	// First connection.
	if (! this.isReconnecting) {
		debug('onopen()');

		if (this.onopen) {
			this.onopen(e);
		}
	}
	// Reconnection.
	else {
		debug('onreconnect()');

		if (this.onreconnect) {
			this.onreconnect(e);
		}
		else if (this.onopen) {
			this.onopen(e);
		}
	}
}


function _onerror(e) {
	debugerror('onerror() | event: %o', e);

	this.hasError = true;

	if (this.onerror) {
		this.onerror(e);
	}
}


function _onclose(e) {
	debugerror('onclose() | event: %o', e);

	var self = this;

	if (this.onclose) {
		this.onclose(e);
	}

	// Don't try to reconnect if we closed the connection.
	if (this.closed) { return; }

	// Don't try to reconnect if an error happened while connecting.
	if (this.hasError) { return; }
	this.hasError = false;

	if (this.reconnectionDelay) {
		this.reconnectionTimer = setTimeout(function() {
			debug('reconnecting ...');

			self.isReconnecting = true;
			self.createWebSocket();
		}, this.reconnectionDelay);
	}
}

},{"debug":14,"websocket":18}],18:[function(require,module,exports){
var _global = (function() { return this; })();
var nativeWebSocket = _global.WebSocket || _global.MozWebSocket;


/**
 * Expose a W3C WebSocket class with just one or two arguments.
 */
function W3CWebSocket(uri, protocols) {
	var native_instance;

	if (protocols) {
		native_instance = new nativeWebSocket(uri, protocols);
	}
	else {
		native_instance = new nativeWebSocket(uri);
	}

	/**
	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
	 * class). Since it is an Object it will be returned as it is when creating an
	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
	 *
	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
	 */
	return native_instance;
}


/**
 * Module exports.
 */
module.exports = {
    'w3cwebsocket' : nativeWebSocket ? W3CWebSocket : null,
    'version'      : require('./version')
};

},{"./version":19}],19:[function(require,module,exports){
module.exports = require('../package.json').version;

},{"../package.json":20}],20:[function(require,module,exports){
module.exports={
  "name": "websocket",
  "description": "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
  "keywords": [
    "websocket",
    "websockets",
    "socket",
    "networking",
    "comet",
    "push",
    "RFC-6455",
    "realtime",
    "server",
    "client"
  ],
  "author": {
    "name": "Brian McKelvey",
    "email": "brian@worlize.com",
    "url": "https://www.worlize.com/"
  },
  "version": "1.0.17",
  "repository": {
    "type": "git",
    "url": "https://github.com/theturtle32/WebSocket-Node.git"
  },
  "homepage": "https://github.com/theturtle32/WebSocket-Node",
  "engines": {
    "node": ">=0.8.0"
  },
  "dependencies": {
    "debug": "~2.1.0",
    "nan": "~1.0.0",
    "typedarray-to-buffer": "~3.0.0"
  },
  "devDependencies": {
    "buffer-equal": "0.0.1",
    "faucet": "0.0.1",
    "gulp": "git+https://github.com/gulpjs/gulp.git#4.0",
    "gulp-jshint": "^1.9.0",
    "jshint-stylish": "^1.0.0",
    "tape": "^3.0.0"
  },
  "config": {
    "verbose": false
  },
  "scripts": {
    "install": "(node-gyp rebuild 2> builderror.log) || (exit 0)",
    "test": "faucet test/unit",
    "gulp": "gulp"
  },
  "main": "index",
  "directories": {
    "lib": "./lib"
  },
  "browser": "lib/browser.js",
  "gitHead": "cda940b883aa884906ac13158fe514229a67f426",
  "bugs": {
    "url": "https://github.com/theturtle32/WebSocket-Node/issues"
  },
  "_id": "websocket@1.0.17",
  "_shasum": "8a572afc6ec120eb41473ca517d07d932f7b6a1c",
  "_from": "websocket@>=1.0.17 <2.0.0",
  "_npmVersion": "1.4.28",
  "_npmUser": {
    "name": "theturtle32",
    "email": "brian@worlize.com"
  },
  "maintainers": [
    {
      "name": "theturtle32",
      "email": "brian@worlize.com"
    }
  ],
  "dist": {
    "shasum": "8a572afc6ec120eb41473ca517d07d932f7b6a1c",
    "tarball": "http://registry.npmjs.org/websocket/-/websocket-1.0.17.tgz"
  },
  "_resolved": "https://registry.npmjs.org/websocket/-/websocket-1.0.17.tgz",
  "readme": "ERROR: No README data found!"
}

},{}]},{},[5])(5)
});