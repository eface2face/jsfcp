module.exports = FloorQuery;


/**
 * Dependencies.
 */
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
FloorQuery.prototype = new EventEmitter();


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
									this.emit("floorGranted", {"floorId":floorId,"beneficiaryId":beneficiaryId, "floorRequestId":floorRequestId});

							}
							else if(status === MessageFactory.C.RS_RELEASED_NAM ||
									status === MessageFactory.C.RS_REVOKED_NAM) {
								this.emit("floorReleased", {"floorId":floorId,"beneficiaryId":beneficiaryId, "floorRequestId":floorRequestId});
							}
						}
					}
				}
			}
		}
	}
	else {
		console.log("ERROR - FloorQuery.onMessageReceived. FloorStatus was expected");
	}
	return null;
};

FloorQuery.prototype.onErrorReceived = function (error) {
	console.warn("FloorQuery.onErrorReceived " + error);
};
