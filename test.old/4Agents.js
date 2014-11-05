var participant10, participant11, participant12, participant13;
var userId, conferenceId, wss;


/* Switch off ajax caching in development */
$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});


function connect(userid)
{	
	var ws_uri = "wss://dev.ef2f.com/mixers/mixer-1/bfcp/";

	var customServer = window.location.hash.substr(1);
	if (customServer)
	  ws_uri = "ws://" + customServer + ":9090/bfcp/";

	console.log("Using WebSocket server at " + ws_uri);
	
	userId = userid;
	conferenceId = 1002; // parseInt($("#txtConferenceId").val());
	wss =  ws_uri + conferenceId + "/" + userid; //$("#slcWss").val();		
	
	//floors = [3];
	floors = [1,2];	
	createParticipant(userid);	
}

function createParticipant(userId)
{
	// AÑADIR LA LISTA DE LOS FLOORSID PARA SUSCRIBIRSE
	var participant = new JsFCP.Participant(conferenceId, userId, wss, floors);
		
	participant.on("floorGranted",function(e) {
		
		var userId = e.sender.userId;
		
		console.log("SUBSCRIPTION: User: " + userId + " participant.onFloorGranted" + e);
		console.log(e);
		
		// update html
		
		var floorId = e.data.floorId;
		var floorRequestId = e.data.floorRequestId;
		var beneficiaryId = e.data.beneficiaryId;
		
		var $divFloor = $("#floorStatus"+userId+floorId);
		$divFloor.html("");
		
		var snippetFS = "<br/><span class='floorId'><input type='radio' name='floorRel' id='fr"+userId+ floorId+"' value='"+floorRequestId+"'><b>FloorId " + floorId + "</b></span>";
		snippetFS += "<br/><span class='floorRequestId' style='margin-left:2em'>floorRequestId: "+floorRequestId+" </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>beneficiaryId: "+beneficiaryId+" </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>Granted: true </span>";		
		snippetFS += " </div>";	
		
		$divFloor.append($(snippetFS));
		
		blinkColors($divFloor, "aquamarine");
	});
	
	participant.on("webSocketReady", function(e) {
		
		alert("WS is ready. Let's go!");
	});
	
	participant.on("webSocketClosed", function(e) {
		
		alert("WS has been closed (oooooohh!)");
	});
	
	participant.on("floorReleased", function(e) {
		
		var userId = e.sender.userId;
		
		console.log("SUBSCRIPTION: User: " + userId + " participant.onFloorReleased " + e);
		console.log(e);
		
		// update html		
		var floorId = e.data.floorId;		
		
		var $divFloor = $("#floorStatus"+userId+floorId);
		$divFloor.html("");
		
		var snippetFS = "<br/><span class='floorId'><input type='radio' name='floorRel' id='fr"+userId+ floorId+"' value='"+floorRequestId+"'><b>FloorId " + floorId + "</b></span>";
		snippetFS += "<br/><span class='floorRequestId' style='margin-left:2em'>floorRequestId: null </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>beneficiaryId: null </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>Granted: false </span>";		
		snippetFS += " </div>";	
		
		$divFloor.append($(snippetFS));
		
		blinkColors($divFloor, "khaki");
		
	});
		
		
	$("#txtUserId, #txtConferenceId, #slcWss")
		.attr("disabled","disabled");
	
	var i, length, snippetFS, snippetFR;
	length = floors.length;
	$("#divFloorStatus"+userId).html("");
	$("#divFloorRequest"+userId).html("");	
	
	for(i = 0; i < length; i++)
	{
		snippetFS = "<div id='floorStatus"+ userId + floors[i]+"'>";
		snippetFS += "<br/><span class='floorId'><input type='radio' name='floorRel' id='fr"+userId+ floors[i]+"' value=null><b>FloorId " + floors[i] + "</b></span>";
		snippetFS += "<br/><span class='floorRequestId' style='margin-left:2em'>floorRequestId: null </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>beneficiaryId: null </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>Granted: false </span>";		
		snippetFS += " </div>";
		
		snippetFR = "<div id='floorRequest"+userId + floors[i]+"'>";
		snippetFR += "<input type='checkbox' name='chkFloorType' value='"+floors[i]+"'> FloorId='"+floors[i]+"'<br>";
		snippetFR += " </div>";
		
		$("#divFloorStatus"+userId).append(snippetFS);
		$("#divFloorRequest"+userId).append(snippetFR);
	}
	if(userId === 10)
	{
		participant10 = participant;
	}
	else if (userId === 11)
	{
		participant11 = participant;
	}
	else if (userId === 12)
	{
		participant12 = participant;
	}
	else if (userId === 13)
	{
		participant13 = participant;
	}
		
}

function switchParticipant(userId)
{
	if(userId === 10)
	{
		return participant10;
	}	
	else if (userId === 11)
	{
		return participant11;
	}
	else if (userId === 12)
	{
		return participant12;
	}	
	else if (userId === 13)
	{
		return participant13;
	}	
}

function queryFloors()
{
	participant.queryFloor([1,2]);
	
	}

function sendHello()
{		
	if(!participant.isServerRunning())
	{
		console.log("Service not running...");
	}
	else
	{	
		participant.sendHello();
	}
}

var personalizedOnPending = function (e) 
{
	console.log("personalizedOnPending");
	
	var userId = this.beneficiaryId;
	var floorRequestId = this.floorRequestId;
	
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div>FloorRequestId: " + floorRequestId + " pending...</div>";
	if(this.statusInfo)
	{
		snippet += "<div>Info: " + this.statusInfo + "</div>";
	}
		
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "peachpuff");
};

var personalizedOnAccepted = function (e) 
{
	console.log("personalizedOnAccepted");
	
	var userId = this.beneficiaryId;
	var floorRequestId = this.floorRequestId;
	
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div>FloorRequestId: " + floorRequestId + " accepted...</div>";
	if(this.statusInfo)
	{
		snippet += "<div>Info: " + this.statusInfo + "</div>";
	}
		
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "orchid");
};

var personalizedOnGranted = function (e) 
{
	console.log("personalizedOnGranted");
	
	var userId = this.beneficiaryId;
	var floorRequestId = this.floorRequestId;
	
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div>FloorRequestId: " + floorRequestId + " granted!!!</div>";
	if(this.statusInfo)
	{
		snippet += "<div>Info: " + this.statusInfo + "</div>";
	}
		
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "lime");
};

var personalizedOnDenied = function (e) 
{
	console.log("personalizedOnDenied");

	var userId = this.beneficiaryId;
	var floorRequestId = this.floorRequestId;
		
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div>FloorRequestId: " + floorRequestId + " denied </div>";
	if(this.statusInfo)
	{
		snippet += "<div>Info: " + this.statusInfo + "</div>";
	}
	
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "indianred");
};

var personalizedOnCancelled = function (e) 
{
	console.log("personalizedOnCancelled");

	var userId = this.beneficiaryId;
	var floorRequestId = this.floorRequestId;
		
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div>FloorRequestId: " + floorRequestId + " cancelled (oh!!) </div>";
	if(this.statusInfo)
	{
		snippet += "<div>Info: " + this.statusInfo + "</div>";
	}
	
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "lightsalmon");
};

var personalizedOnReleased = function (e) 
{
	console.log("personalizedOnReleased");

	var userId = this.beneficiaryId;
	var floorRequestId = this.floorRequestId;
		
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div>FloorRequestId: " + floorRequestId + " released (yeeeah!) </div>";
	if(this.statusInfo)
	{
		snippet += "<div>Info: " + this.statusInfo + "</div>";
	}
	
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "royalblue");
};

var personalizedOnRevoked = function (e) 
{
	console.log("personalizedOnRevoked");

	var userId = this.beneficiaryId;
	var floorRequestId = this.floorRequestId;
		
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div>FloorRequestId: " + floorRequestId + " revoked :(  </div>";
	if(this.statusInfo)
	{
		snippet += "<div>Info: " + this.statusInfo + "</div>";
	}
	
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "silver");
};

var personalizedOnError = function(e)
{	
	console.log("personalizedOnError");

	var userId = this.beneficiaryId;
	//var floorRequestId = this.floorRequestId;
		
	var $divMsg = $("#divMsg"+userId);
	$divMsg.html("");
	
	var snippet = "<div><b> ERROR!!! </b></div>";
	snippet += "<div><b> Code: </b> " + e.data.errorCode + "</div>";
	snippet += "<div><b> Info: </b>" + e.data.errorInfo + "</div><br>";
	
	$divMsg.append($(snippet));
	
	blinkColors($divMsg, "indianred");
	
};

function requestFloor(userId)
{
	var beneficiaryId;
	var arrayFloors = [];
	
	var events = {};
	
	clearDivMsg();
	
	events.pending = personalizedOnPending;
	events.accepted = personalizedOnAccepted;
	events.granted = personalizedOnGranted;
	events.denied = personalizedOnDenied;
	events.cancelled = personalizedOnCancelled;
	events.released = personalizedOnReleased;
	events.revoked = personalizedOnRevoked;
	events.error = personalizedOnError;
	
	var $divChecks = $("#divFloorRequest"+userId);
	
	$divChecks.find("input[type='checkbox']:checked").each ( function() {		   
		   arrayFloors.push(parseInt($(this).val()));
	});	
	
	
	console.log("arrayFloors: " + arrayFloors);
	
	var participant = switchParticipant(userId);
	
	//arrayFloorTypes.push(parseInt($("#slcFloorType").val()));	
	if($("#bMe"+userId).is(":checked"))
	{		
		participant.requestFloor(events, arrayFloors);
		// this is the same (beneficiaryId = userId)
		// participant.requestFloor(events, arrayFloors, userId);		
	}
	else
	{		
		beneficiaryId = parseInt($("#txtBeneficiaryId"+userId).val());
		participant.requestFloor(events, arrayFloors, beneficiaryId);		
	}
}



function releaseFloor(userId)
{
	var events = {};
	clearDivMsg();
	
	events.error = personalizedOnError;
	
	var participant = switchParticipant(userId);
	
	var floorRequestId =  parseInt(($("#divFloorStatus"+userId).find("input[type='radio']:checked").val()));	
	participant.release(events, floorRequestId);
}

function clearDivMsg()
{
console.log("clearDivMsg");
	$("#mainDiv").find(".divMsg").html("");
}


//var interval;
function blinkColors($div, color) {
	
	var timems = 250;
	
	$div.css("background-color",color);
	setTimeout(function() { 
		
		$div.css("background-color","#FFFFFF"); 
		setTimeout(function() { 
			$div.css("background-color",color); 
			setTimeout(function() { $div.css("background-color","#FFFFFF"); },timems);
			
		},timems);
	},timems);
	
	
	
	
}

