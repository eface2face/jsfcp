module.exports = FloorRequest;


/**
 * Dependencies.
 */
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
	if(json[MessageFactory.C.HD_PRIMITIVE] ===MessageFactory.C.PRI_FL_REQUEST_STATUS_NAM) {
		var floorRequestInformation = json[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_FLOOR_REQUEST_INFORMATION_NAM];
		var statusInfo =  json[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_STATUS_INFO_NAM];

		// Don't update if new status is lower than current status (it could be a "lost" message)
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
							console.log("FloorRequest.onMessageReceived: onPending ", this.floorRequestId);
							this.onPending();
							return true;
						}
						else if(this.status === MessageFactory.C.RS_ACCEPTED_NAM) {
							console.log("FloorRequest.onMessageReceived: onAccepted ", this.floorRequestId);
							this.onAccepted(this);
							return true;
						}
						else if(this.status === MessageFactory.C.RS_GRANTED_NAM) {
							console.log("FloorRequest.onMessageReceived: onGranted ", this.floorRequestId);
							this.onGranted(this);
							return true;
						}
						else if(this.status === MessageFactory.C.RS_DENIED_NAM) {
							console.log("FloorRequest.onMessageReceived: onDenied ", this.floorRequestId);
							this.onDenied(this);
							return false;
						}
						else if(this.status === MessageFactory.C.RS_CANCELLED_NAM) {
							console.log("FloorRequest.onMessageReceived: onCancelled ", this.floorRequestId);
							this.onCancelled(this);
							return false;
						}
						else if(this.status === MessageFactory.C.RS_RELEASED_NAM) {
							console.log("FloorRequest.onMessageReceived: onReleased ", this.floorRequestId);
							this.onReleased(this);
							return false;
						}
						else if(this.status === MessageFactory.C.RS_REVOKED_NAM) {
							console.log("FloorRequest.onMessageReceived: onRevoked ", this.floorRequestId);
							this.onRevoked(this);
							return false;
						}
					}
				}
			}
		}
	}
	else {
		console.log("ERROR - FloorRequest.onMessageReceived. FloorRequestStatus was expected");
	}
	return null;
};


FloorRequest.prototype.onErrorReceived = function(error) {
	console.log("FloorRequest.onErrorReceived " + error);

	var errorCode = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_CODE_NAM];
	var errorInfo = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_INFO_NAM];

	if(this.onError !== undefined) {
		// TODO: He cambiado esto, hablar con Carmen.
		this.onError({"errorCode": errorCode, "errorInfo": errorInfo});
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