module.exports = FloorRelease;


/**
 * Dependencies.
 */
var MessageFactory = require('./MessageFactory');


function FloorRelease(pEvents, pFloorRequestId, pBeneficiaryId){
	this.beneficiaryId = pBeneficiaryId;
	this.floorRequestId = pFloorRequestId;
	this.onError = pEvents.error;
}

FloorRelease.prototype.onMessageReceived = function(json) {
	console.log("FloorRelease - onMessageReceived. This function shouldn't be called. ", json);
};

FloorRelease.prototype.onErrorReceived = function (error) {
	console.warn("FloorRelease - onErrorReceived. ", error);

	var errorCode = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_CODE_NAM];
	var errorInfo = error[MessageFactory.C.HD_ATTRIBUTES][MessageFactory.C.ATT_ERROR_INFO_NAM];

	if(this.onError !== undefined) {
		// TODO: He cambiado esto, hablar con Carmen.
		this.onError({"errorCode": errorCode, "errorInfo": errorInfo});
	}
};
