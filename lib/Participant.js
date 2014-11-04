module.exports = Participant;


/**
 * Dependencies.
 */
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

	this.transport.on("connected", function() {
		self.queryFloor(pFloors);
		self.emit("connected");
	});

	this.transport.on("disconnected", function() {
		self.emit("disconnected");
	});

	this.transport.on("response", function(e) {
		self.manageResponse(e.data);
	});

	this.transport.on("notification", function(e) {
		self.manageNotification(e.data);
	});
}

/**
 * Events:
 * - connected
 * - disconnected
 * - floorGranted
 * - floorReleased
 */
Participant.prototype = new EventEmitter();

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
				console.log("WARN: Participant.manageResponse: n object FloorRequest/FloorRelease was expected");
			}
		}
	}
	else {
		// We were not waiting for that response. Ignore
		console.error("Participant.manageResponse: it's not a response; we were not waiting for this");
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
	var self = this;

	if(pArrayFloorIds.length > 0) {
		var transactionId = Math.floor(Math.random() * 10000);
		var floorQuery = new FloorQuery(pArrayFloorIds);
		this.transactionMap[transactionId] = floorQuery;
		this.floorQuery = floorQuery;

		floorQuery.on("onFloorGranted", function(e)	{
			self.emit("floorGranted", e.data);
		});

		floorQuery.on("onFloorReleased", function(e) {
			self.emit( "floorReleased", e.data);
		});

		var jsonMsg = this.messageFactory.createQueryFloor(transactionId,
			pArrayFloorIds);
		this.transport.send(jsonMsg);
	}
	// else {
		// TODO: Throw exception informing there's no floor with that type  CARMEN
	// }
};