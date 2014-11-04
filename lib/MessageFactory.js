module.exports = MessageFactory;


/**
 * Dependencies.
 */
var Exceptions = require('./Exceptions');


var C = {
	CNF_OPTIONAL : "optional",
	CNF_MULTI : "multiple",

	// JSON Message
	HD_VER : "ver",// 1 for initial version
	HD_VER_1 : 1,
	HD_PRIMITIVE : "primitive",// Main purpose
	HD_CONFERENCE_ID : "conferenceId",
	HD_TRANSACTION_ID : "transactionId",
	HD_USER_ID : "userId",
	HD_HEADER : "header",
	HD_ATTRIBUTES : "attributes",

	// Primitives
	PRI_FL_REQUEST_NAM : "FloorRequest",
	PRI_FL_REQUEST_VAL : 1,
	PRI_FL_RELEASE_NAM : "FloorRelease",
	PRI_FL_RELEASE_VAL : 2,
	PRI_FL_REQUEST_QUERY_NAM : "FloorRequestQuery",
	PRI_FL_REQUEST_QUERY_VAL : 3,
	PRI_FL_REQUEST_STATUS_NAM : "FloorRequestStatus",
	PRI_FL_REQUEST_STATUS_VAL : 4,
	PRI_FL_USER_QUERY_NAM : "UserQuery",
	PRI_FL_USER_QUERY_VAL : 5,
	PRI_FL_USER_STATUS_NAM : "UserStatus",
	PRI_FL_USER_STATUS_VAL : 6,
	PRI_FL_QUERY_NAM : "FloorQuery",
	PRI_FL_QUERY_VAL : 7,
	PRI_FL_STATUS_NAM : "FloorStatus",
	PRI_FL_STATUS_VAL : 8,
	PRI_CH_ACTION_NAM : "ChairAction",
	PRI_CH_ACTION_VAL : 9,
	PRI_CH_ACTION_ACK_NAM : "ChairActionAck",
	PRI_CH_ACTION_ACK_VAL : 10,
	PRI_HELLO_NAM : "Hello",
	PRI_HELLO_VAL : 11,
	PRI_HELLO_ACK_NAM : "HelloAck",
	PRI_HELLO_ACK_VAL : 12,
	PRI_ERROR_NAM : "Error",
	PRI_ERROR_VAL : 13,

	// Attributes
	ATT_BENEFICIARY_ID_NAM : "beneficiaryId",
	ATT_BENEFICIARY_ID_VAL : 1,
	ATT_FL_ID_NAM : "floorId",
	ATT_FL_ID_VAL : 2,
	ATT_FL_REQUEST_ID_NAM : "floorRequestId",
	ATT_FL_REQUEST_ID_VAL : 3,
	ATT_PRIORITY_NAM : "priority",
	ATT_PRIORITY_VAL : 4,
	ATT_REQUEST_STATUS_NAM : "requestStatus",
	ATT_REQUEST_STATUS_VAL : 5,
	ATT_ERROR_CODE_NAM : "errorCode",
	ATT_ERROR_CODE_VAL : 6,
	ATT_ERROR_INFO_NAM : "errorInfo",
	ATT_ERROR_INFO_VAL : 7,
	ATT_PARTICIPANT_PROVIDED_INFO_NAM : "participantProvidedInfo",
	ATT_PARTICIPANT_PROVIDED_INFO_VAL : 8,
	ATT_STATUS_INFO_NAM : "statusInfo",
	ATT_STATUS_INFO_VAL : 9,
	ATT_SUPPORTED_ATTRIBUTES_NAM : "supportedAttributes",
	ATT_SUPPORTED_ATTRIBUTES_VAL : 10,
	ATT_SUPPORTED_PRIMITIVES_NAM : "supportedPrimitives",
	ATT_SUPPORTED_PRIMITIVES_VAL : 11,
	ATT_USER_DISPLAY_NAME_NAM : "userDisplayName",
	ATT_USER_DISPLAY_NAME_VAL : 12,
	ATT_USER_URI_NAM : "userUri",
	ATT_USER_URI_VAL : 13,
	ATT_BENEFICIARY_INFORMATION_NAM : "beneficiaryInformation",
	ATT_BENEFICIARY_INFORMATION_VAL : 14,
	ATT_FLOOR_REQUEST_INFORMATION_NAM : "floorRequestInformation",
	ATT_FLOOR_REQUEST_INFORMATION_VAL : 15,
	ATT_REQUESTED_BY_INFORMATION_NAM : "requestedByInformation",
	ATT_REQUESTED_BY_INFORMATION_VAL : 16,
	ATT_FL_REQUEST_STATUS_NAM : "floorRequestStatus",
	ATT_FL_REQUEST_STATUS_VAL : 17,
	ATT_OVERALL_REQUEST_STATUS_NAM : "overallRequestStatus",
	ATT_OVERALL_REQUEST_STATUS_VAL : 18,
	ATT_REQUESTED_BY_ID_NAM : "requestedById",
	ATT_REQUESTED_BY_ID_VAL : 19,
	ATT_EXTENSION_ATTRIBUTE_NAM : "extensionAttribute",
	ATT_EXTENSION_ATTRIBUTE_VAL : 20,
	ATT_REQUEST_STATUS_VALUE_NAM : "status",
	ATT_REQUEST_STATUS_VALUE_VAL : 21,
	ATT_QUEUE_POSITION_NAM : "queuePosition",
	ATT_QUEUE_POSITION_VAL : 22,
	ATT_SUPPORTED_FLOORTYPES_NAM : "supportedFloorTypes",
	ATT_SUPPORTED_FLOORTYPES_VAL : 23,

	// Priority
	PR_LOWEST_NAM : "Lowest",
	PR_LOWEST_VAL : 0,
	PR_LOW_NAM : "Low",
	PR_LOW_VAL : 1,
	PR_NORMAL_NAM : "Normal",
	PR_NORMAL_VAL : 2,
	PR_HIGH_NAM : "High",
	PR_HIGH_VAL : 3,
	PR_HIGHEST_NAM : "Highest",
	PR_HIGHEST_VAL : 4,

	// Request Status
	RS_PENDING_NAM : "Pending",
	RS_PENDING_VAL : 1,
	RS_ACCEPTED_NAM : "Accepted",
	RS_ACCEPTED_VAL : 2,
	RS_GRANTED_NAM : "Granted",
	RS_GRANTED_VAL : 3,
	RS_DENIED_NAM : "Denied",
	RS_DENIED_VAL : 4,
	RS_CANCELLED_NAM : "Cancelled",
	RS_CANCELLED_VAL : 5,
	RS_RELEASED_NAM : "Released",
	RS_RELEASED_VAL : 6,
	RS_REVOKED_NAM : "Revoked",
	RS_REVOKED_VAL : 7,

	// Error Code
	ERR_NO_CONF_NAM : "ErrorConferenceDoesNotExist",
	ERR_NO_CONF_VAL : 1,
	ERR_NO_USER_NAM : "UserDoesNotExist",
	ERR_NO_USER_VAL : 2,
	ERR_UNK_PR_NAM : "UnknownPrimitive",
	ERR_UNK_PR_VAL : 3,
	ERR_UNK_ATT_NAM : "UnknownMandatoryAttribute",
	ERR_UNK_ATT_VAL : 4,
	ERR_UNAUTH_OP_NAM : "UnauthorizedOperation",
	ERR_UNAUTH_OP_VAL : 5,
	ERR_INV_FL_ID_NAM : "InvalidFloorId",
	ERR_INV_FL_ID_VAL : 6,
	ERR_NO_FL_RQ_ID_NAM : "FloorRequestIdDoesNotExist",
	ERR_NO_FL_RQ_ID_VAL : 7,
	ERR_MAX_FL_RQ_NAM : "FloorRequestMaxNumberReached",
	ERR_MAX_FL_RQ_VAL : 8,
	ERR_TLS_NAM : "UseTls",
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

MessageFactory.prototype.sendWsMessage = function (message) {
	if(this.isWebSocketReady())	{
		this.webSocket.send(message);
	}
	else {
		throw new Exceptions.NoWebSocketException();
	}
};

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
		console.error("MessageFactory.validatePacket: Invalid message format. Message was not sended --- Msg: " +
				JSON.stringify(json));
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
			msg = "Invalid Message - " + item + " was not founded in header. Message: "+ JSON.stringify(jsonObject);
			console.error(msg);
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
		console.error("Message format error. Primitive '" + primitive + "' doesn't belong to primitives list. " +
				"JSON Object: " + str);
		throw new Exceptions.InvalidMessageFormatPrimitive(str);
	}

	var standard_primitive = format[primitive];
	attributeList = jsonObject[C.HD_ATTRIBUTES];

	for (var attr in standard_primitive) {
		// Is a mandatory attribute
		if(!standard_primitive[attr][C.CNF_OPTIONAL]) {
			if(!attributeList[attr])
			{
				msg = "Message format error. There is no attribute " + attr + " in " + JSON.stringify(jsonObject);
				console.error(msg);
				errorList.push(msg);
			}
		}
	}

	// Check if the att which doesn't belong to header has the correct format
	for (attr in attributeList) {
		if(headerFormat.indexOf(attr) < 0) {
			// The attr should no be in that msg
			if(!standard_primitive[attr]) {
				msg = "Message format error. Attribute "+ attr + " doesn't belong to " +
					primitive + " specification. JSON Object: "  + JSON.stringify(jsonObject);
				console.error(msg);
				errorList.push(msg);
			}
			else { // Check the format multi/single is correct
				value = attributeList[attr];
				if(value instanceof Array) {
					if(!standard_primitive[attr][C.CNF_MULTI]) {
						msg = "Message format error. The value of " + attr +
						" doesn't fit with the format for " + primitive +
						". Value type shouldn't be an array" +
						". JSON Object: "  + JSON.stringify(jsonObject);
						console.error(msg);
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
						msg = "Message format error. The value of " + attr +
						" doesn't fit with the format for " + primitive +
						". Value type should be an array" +
						". JSON Object: "  + JSON.stringify(jsonObject);
						console.error(msg);
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

	msg = " These errors were founded in JSON Message: " + str;
	for(var j = 0; j < errorList.length; j++) {
		msg += "\n Error n. " + j + " - ";
		msg += errorList[j];
	}
	if(j>0) {
		console.log("checkValidMessageFormat - ERRORS - " + msg);
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
				msg = "checkJsfcpAttributeFormat: Attribute " +  C.ATT_PRIORITY_NAM +
					" - '" + value + "' is not a valid value";
				console.error(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_REQUEST_STATUS_NAM:
			// Checks the value is correct. Value is a JSON object
			var status = value[C.ATT_REQUEST_STATUS_VALUE_NAM];
			if(!status || status === "undefined") {
				msg = "checkJsfcpAttributeFormat: Attribute " + C.ATT_REQUEST_STATUS_NAM +
				" - Any " + C.ATT_REQUEST_STATUS_VALUE_NAM + " was founded ";
				console.error(msg);
				errorList.push(msg);
			}
			if(!isValidRequestedStatusValue(status)) {
				msg = "checkJsfcpAttributeFormat: Attribute " +  C.ATT_REQUEST_STATUS_NAM +
				" - '" + status + "' is not a valid value";
				console.error(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_ERROR_CODE_NAM:
			// Checks the value is correct. Value is a text
			if(!isValidErrorValue(value)) {
				msg = "checkJsfcpAttributeFormat: Attribute " + C.ATT_ERROR_CODE_NAM +
					" - '" + value + "' is not a valid value for attribute " +
					C.ATT_ERROR_CODE_NAM;
				console.error(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_FLOOR_REQUEST_INFORMATION_NAM:
			index = attributeList.indexOf(C.ATT_FL_REQUEST_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = "checkJsfcpAttributeFormat: Attribute " +
					C.ATT_FLOOR_REQUEST_INFORMATION_NAM +
					" - Any " + C.ATT_FL_REQUEST_ID_NAM + " was founded ";
				console.error(msg);
				errorList.push(msg);
			}
			// Checks C.ATT_FL_REQUEST_STATUS_NAM exists
			if(attributeList.indexOf(C.ATT_FL_REQUEST_STATUS_NAM)<0) {
				msg = "checkJsfcpAttributeFormat: Attribute " +
					C.ATT_FLOOR_REQUEST_INFORMATION_NAM +
					" - Any " + C.ATT_FL_REQUEST_STATUS_NAM + " was founded ";
				console.error(msg);
				errorList.push(msg);
			}
			else {
				// Checks C.ATT_FL_REQUEST_STATUS_NAM is an Array
				if(!(value[C.ATT_FL_REQUEST_STATUS_NAM] instanceof Array)) {
					msg = "checkJsfcpAttributeFormat: Attribute " +
						C.ATT_FLOOR_REQUEST_INFORMATION_NAM + " . " +
						C.ATT_FL_REQUEST_STATUS_NAM +
						" should be an Array";
					console.error(msg);
					errorList.push(msg);
				}
			}
			break;

		case C.ATT_OVERALL_REQUEST_STATUS_NAM:
			index = attributeList.indexOf(C.ATT_FL_REQUEST_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = "checkJsfcpAttributeFormat: Attribute " +
					C.ATT_OVERALL_REQUEST_STATUS_NAM +
					" - Any " + C.ATT_FL_REQUEST_ID_NAM + " was founded ";
				console.error(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_FL_REQUEST_STATUS_NAM:
			index = attributeList.indexOf(C.ATT_FL_ID_NAM);
			// Checks C.ATT_FL_ID_NAM exists
			if( index < 0) {
				msg = "checkJsfcpAttributeFormat: Attribute " +
					C.ATT_FL_REQUEST_STATUS_NAM +
					" - Any " + C.ATT_FL_ID_NAM + " was founded ";
				console.error(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_BENEFICIARY_INFORMATION_NAM:
			index = attributeList.indexOf(C.ATT_BENEFICIARY_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = "checkJsfcpAttributeFormat: Attribute " +
					C.ATT_BENEFICIARY_INFORMATION_NAM +
					" - Any " + C.ATT_BENEFICIARY_ID_NAM + " was founded ";
				console.error(msg);
				errorList.push(msg);
			}
			break;

		case C.ATT_REQUESTED_BY_INFORMATION_NAM:
			index = attributeList.indexOf(C.ATT_REQUESTED_BY_ID_NAM);
			// Checks C.ATT_FL_REQUEST_ID_NAM exists
			if( index < 0) {
				msg = "checkJsfcpAttributeFormat: Attribute " +
					C.ATT_REQUESTED_BY_INFORMATION_NAM +
					" - Any " + C.ATT_REQUESTED_BY_ID_NAM + " was founded ";
				console.error(msg);
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
			msg = " Attribute List [" +  pAttList +
				"] - Not valid attribute list because of [" + pAttList[i] + "]";
			console.error(msg);
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

MessageFactory.prototype.isWebSocketReady = function() {
	return this.webSocket && this.webSocket.readyState === this.webSocket.OPEN;
};


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
