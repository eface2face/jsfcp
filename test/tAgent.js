var participant;
var userId, conferenceId, wss;


/* Switch off ajax caching in development */
$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});
function connect()
{	
	userId = parseInt($("#txtUserId").val());
	conferenceId =  parseInt($("#txtConferenceId").val());
	wss = $("#slcWss").val();		
	
	floors = [1,2];
	
	// AÑADIR LA LISTA DE LOS FLOORSID PARA SUSCRIBIRSE
	participant = new JsFCP.Participant(userId, conferenceId, wss, floors);
		
	participant.on("floorGranted",function(e) {
		//alert("participant.onFloorGranted");
		console.log("SUSCRIPCIÓN: participant.onFloorGranted" + e);
		//console.log("floorId:" + floorId + ", beneficiaryId:" + beneficiaryId + ", floorRequestId:" + floorRequestId);
	});
	
	participant.on("floorReleased", function(e) {
		//alert("participant.onFloorReleased");
		console.log("participant.onFloorReleased " + e);
		//console.log("floorId:" + floorId);
	});
	
	participant.on("onPrueba",function(){
			console.error("Participant probando probando2!");				
		});
	
		
	$("#txtUserId, #txtConferenceId, #slcWss")
		.attr("disabled","disabled");
	
	var i, length, snippetFS, snippetFR;
	length = floors.length;
	$("#divFloorStatus").html("");
	$("#divFloorRequest").html("");	
	
	for(i = 0; i < length; i++)
	{
		snippetFS = "<div id='floorStatus"+floors[i]+"'>";
		snippetFS += "<br/><span class='floorId'><input type='radio' name='floorRel' id='fr"+floors[i]+"' value='"+floors[i]+"'><b>FloorId " + floors[i] + "</b></span>";
		snippetFS += "<br/><span class='floorRequestId' style='margin-left:2em'>floorRequestId: 0 </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>beneficiaryId: 0 </span>";
		snippetFS += "<br/><span class='beneficiaryId' style='margin-left:2em'>Granted: false </span>";		
		snippetFS += " </div>";
		
		snippetFR = "<div id='floorRequest"+floors[i]+"'>";
		snippetFR += "<input type='checkbox' name='chkFloorType' value='"+floors[i]+"'> FloorId='"+floors[i]+"'<br>"
		snippetFR += " </div>";
		
		$("#divFloorStatus").append(snippetFS);
		$("#divFloorRequest").append(snippetFR);
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
	console.log('estoy pending...');
};

var personalizedOnAccepted = function (e) 
{
	console.log('estoy accepted...');
};

var personalizedOnGranted = function (e) 
{
	alert("ole ole y ole!")
	console.log('estoy granted...');
};

var personalizedOnDenied = function (e) 
{
	alert("  :o(    ")
	console.log('estoy denied ...');
};


function requestFloor()
{
	var beneficiaryId;
	var arrayFloors = [];
	
	var events = {};
	
	//events.onPending = personalizedOnPending;
	events.onAccepted = personalizedOnAccepted;
	events.onGranted = personalizedOnGranted;
	events.onDenied = personalizedOnDenied;
	
	
	$("input[type=checkbox]:checked").each ( function() {		   
		   arrayFloors.push(parseInt($(this).val()));
	});	
	
	//arrayFloorTypes.push(parseInt($("#slcFloorType").val()));	
	if($("#bMe").is(":checked"))
	{
		console.log("me");
		participant.requestFloor(events, arrayFloors);
		// this is the same (beneficiaryId = userId)
		// participant.requestFloor(events, arrayFloors, userId);		
	}
	else
	{
		console.log("beneficiary");
		beneficiaryId = parseInt($("#txtBeneficiaryId").val());
		participant.requestFloor(events, arrayFloors, beneficiaryId);		
	}
}

var personalizedOnError = function()
{
	alert("error received!");
};

function releaseFloor()
{
	var events = {};
	
	events.onError = personalizedOnError;
	
	var floorTypeId =  parseInt(($("#slcFloorType").val()));	
	participant.releaseFloor(events, floorTypeId);
}

/*function floorQuery()
{
	var floorTypeIds = []; // = [($("#slcFloorType").val())];	
	
	$("input[type=checkbox]:checked").each ( function() {		   
		floorTypeIds.push( parseInt($(this).val()));
	});
	
	participant.queryFloor(floorTypeIds);
}*/

/*
function updateFloors(floorList)
{
	var flSnippet = ""; 
	var floor, length;
	console.log("updating floor list... here!!!");
	
	length = floorList.length;
	for(var i = 0; i < length; i++)
	{
		floor = floorList[i];
		flSnippet += "<br/>";
		flSnippet += "<div>";
		flSnippet += "<div>Type: "+floor.type+"</div>";
		flSnippet += "<div>Id: "+floor.id+"</div>";
		flSnippet += "<div>RequestId: "+floor.requestId+"</div>";
		flSnippet += "<div>BeneficiaryId: "+floor.beneficiary+"</div>";
		flSnippet += "<div>RequestedById: "+floor.requestedBy+"</div>";
		flSnippet += "<div>Status: "+floor.status+"</div>";
		flSnippet += "<div>Queue: "+floor.queue+"</div>";
		
		flSnippet += "</div>";
	}	
	document.getElementById("divFloorResults").innerHTML = flSnippet;		 
}
*/

//--------  testing -> not for real use

function TESTCHAIRACTION()
{
	participant.TEST_CHAIR_ACTION();
	}