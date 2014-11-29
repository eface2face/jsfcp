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
		// TODO: He cambiado esto, hablar con Carmen.
		this.onError({'errorCode': errorCode, 'errorInfo': errorInfo});
	}
};
