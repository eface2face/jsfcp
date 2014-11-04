/* Switch off ajax caching in development */
$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});

function isInstanceOf(e,type)
{
	if(e instanceof type)
	{
		return true;
	}
	else{
		return false;
	}
}


test( 'Protocol - Message Format', function() {
	console.log ('\n\t Protocol - Message Format: \n');
	var i = 0;
	var json;
	
	function log()
	{
		console.log("\n Test number " + ++i);
	}
	
	
	
	//ok(floorQuery1(),"floorQuery - ok ");
	//ok(floorQuery2(),"floorQuery - wrong floorId format - no array ");
	//ok(floorQuery3(),"floorQuery - no floorId att ");
	//return;
	

	function header1()
	{
		json = {					
				primitive:'FloorRequest',
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorId:[67],
					priority:"High"	
				}
		};
		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidHeaderFormat);			
		}
	}
	log();
	ok(header1(),"header - no 'ver'");
	
	
	function header2()
	{
		json = {					
				primitive:'FloorRequest',
				transactionId:43,
				conferenceId:76,	
				ver:1,	
				attributes: {
					floorId:[67],
					priority:"High"
				}
		};
		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidHeaderFormat);			
		}
	}
	log();
	ok(header2(),"header - no 'userId'");
	
	
	function header3()
	{
		json = {					
				primitive:'FloorRequest',
				transactionId:43,
				userId:98,	
				ver:1,	
				attributes: {
					floorId:[67],
					priority:"High"
				}
		};
		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidHeaderFormat);			
		}
	}
	log();
	ok(header3(),"header - no 'conferenceId'");
	
	
	function header4()
	{
		json = {					
				ver:1,				
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorId:[67],
					priority:"High"			
				}
		};
		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidHeaderFormat);			
		}
	}
	log();
	ok(header4(),"header - no 'primitive'");
	
	
	function header5()
	{
		json = {					
				ver:1,				
				transactionId:43,
				primitive:'foo',
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorId:[67],
					priority:"High"
				}
		};
		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormatPrimitive);			
		}
	}
	log();
	ok(header5(),"header - invalid 'primitive'");
		
	
	function floorRequest1()
	{
		json = {		
				ver:1,
				primitive:'FloorRequest',
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorId:[67],
					priority:"High"			
				}
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(floorRequest1(),"floorRequest - ok");	
	
	
	function floorRequest2()
	{
		json = {		
				ver:1,
				primitive:'FloorRequest',
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					priority:"High"
				}
		};
		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}		
	}
	log();
	ok(floorRequest2(),"floorRequest - no floorId");	
	
	function floorRequest3()
	{
		json = {		
				ver:1,
				primitive:'FloorRequest',
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorId:[67],
					priority:"foo",
				}
		};
		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}		
	}
	log();
	ok(floorRequest3(),"floorRequest - wrong priority");	
	
	
	function floorRequest4()
	{
		json = {		
				ver:1,
				primitive:'FloorRequest',
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorId:67,
					priority:"High"	
				}
		};		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}	
	}
	log();
	ok(floorRequest4(),"floorRequest - no floorId as array");
	
	
	function floorRelease1()
	{
		json = {		
				ver:1,
				primitive:'FloorRelease',
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorRequestId:12
				}
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(floorRelease1(),"floorRelease - ok");
	
	function floorRelease2()
	{
		json = {		
				ver:1,
				primitive:'FloorRelease',
				transactionId:43,
				conferenceId:76,	
				userId:98,	
				attributes: {
					floorId:['67'],
					priority:"High"	
				}
		};				
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}		
	}
	log();
	ok(floorRelease2(),"floorRelease - wrong atts (floorRequestId, floorId, priority");
	
	
	function floorRelease3()
	{
		json = {		
				ver:1,
				primitive:'FloorRelease',
				transactionId:43,
				conferenceId:76,	
				userId:98,		
				attributes: {
					floorRequestId:[12]		
				}
		};
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}		
	}
	log();
	ok(floorRelease3(),"floorRelease - floorRequestId shouldn't be an array");
	
	
	function userQuery1()
	{
		json = {		
				ver:1,
				primitive:'UserQuery',
				transactionId:43,
				conferenceId:76,
				userId:98,
				attributes: {					
				}
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(userQuery1(),"userQuery - ok - no beneficiary information");
	
	
	function userQuery2()
	{
		json = {		
				ver:1,
				primitive:'UserQuery',
				transactionId:43,
				conferenceId:76,	
				userId:9,
				attributes: {
					beneficiaryId:77
				}
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(userQuery2(),"userQuery - ok - with beneficiary information");
	
	
	function userQuery3()
	{
		json = {		
				ver:1,
				primitive:'UserQuery',
				transactionId:43,
				conferenceId:76,	
				userId:9,
				attributes: {
					beneficiaryId:[77]
				}
		};		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}	
	}
	log();
	ok(userQuery3(),"userQuery - wrong beneficiaryid format");
	
	
	function floorQuery1()
	{
		json = {		
				ver:1,
				primitive:'FloorQuery',
				transactionId:43,
				conferenceId:76,	
				userId:98, 
				attributes: {
					floorId:[5,6,7]
				}
				
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(floorQuery1(),"floorQuery - ok ");
	
	function floorQuery2()
	{
		json = {		
				ver:1,
				primitive:'FloorQuery',
				transactionId:43,
				conferenceId:76,	
				userId:98, 
				attributes: {
					floorId:6
				}
				
		};				
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}
	}
	log();
	ok(floorQuery2(),"floorQuery - wrong floorId format - no array ");
	
	
	function floorQuery3()
	{
		json = {		
				ver:1,
				primitive:'FloorQuery',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {}
		};				
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}
	}
	log();
	ok(floorQuery3(),"floorQuery - no floorId att ");
	
	
	
	function floorRequestQuery1()
	{
		json = {		
				ver:1,
				primitive:'FloorRequestQuery',
				transactionId:43,
				conferenceId:76,	
				userId:98, 
				attributes: {
					floorRequestId:7
				}
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(floorRequestQuery1(),"FloorRequestQuery - ok ");
	
	function floorRequestQuery2()
	{
		json = {		
				ver:1,
				primitive:'FloorRequestQuery',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {}
		};				
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}
	}
	log();
	ok(floorRequestQuery2(),"FloorRequestQuery - no floorRequestId");
	
	
	function floorRequestQuery3()
	{
		json = {		
				ver:1,
				primitive:'FloorRequestQuery',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {
					floorRequestId:[7]
				}
		};			
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}
	}
	log();
	ok(floorRequestQuery3(),"FloorRequestQuery - wrong format for floorRequestId - array");
	
	
	function hello1()
	{
		json = {		
				ver:1,
				primitive:'Hello',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {}
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(hello1(),"Hello - ok ");
	
	
	function hello2()
	{
		json = {		
				ver:1,
				primitive:'Hello',
				transactionId:43,
				conferenceId:76,	
				userId:98, 
				attributes: {
					floorRequestId:[7]
				}
							
		};		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}	
	}
	log();
	ok(hello2(),"Hello - wrong att ");
	
	
	function chairAction1()
	{
		json = {		
				ver:1,
				primitive:'ChairAction',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {
					floorRequestInformation: {					
						floorRequestId:123,
						overallRequestStatus:{
							floorRequestId:456,
							requestStatus:{
								requestStatusValue:'Pending',
								queuePosition:1},
							statusInfo:'Some text'		
						},
						floorRequestStatus:[{
							floorId:'67',
							requestStatus:{
								requestStatusValue:'Granted',
								queuePosition:2
							},
							statusInfo:'More text'
						}],
						beneficiaryInformation:{
							beneficiaryId:77,
							userDisplayName:'Paco Garcia',
							userUri:'http://www.example.com'	
						},
						requestedByInformation:{
							requestedById:'99',
							userDisplayName:'Paco Romero',
							userUri:'http://www.myexample.com'
						},
						priority:'Normal',
						participantProvidedInfo:'A little more of text'	
					}
				}
		};		
		return protocol.sendPacket(json);		
	}
	log();
	ok(chairAction1(),"ChairAction - ok ");
	
	function chairAction2()
	{
		json = {		
				ver:1,
				primitive:'ChairAction',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {
					floorRequestInformation: {					
						floorRequestId:123,
						overallRequestStatus:{
							floorRequestId:456,
							requestStatus:{
								requestStatusValue:'Pending',
								queuePosition:1},
							statusInfo:'Some text'		
						},					
						beneficiaryInformation:{
							beneficiaryId:77,
							userDisplayName:'Paco Garcia',
							userUri:'http://www.example.com'	
						},
						requestedByInformation:{
							requestedById:'99',
							userDisplayName:'Paco Romero',
							userUri:'http://www.myexample.com'
						},
						priority:'Normal',
						participantProvidedInfo:'A little more of text'	
					}
				}
		};			
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}			
	}
	log();
	ok(chairAction2(),"ChairAction - no floorRequestStatus ");
	
	
	function chairAction3()
	{
		json = {		
				ver:1,
				primitive:'ChairAction',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {
					floorRequestInformation: {	
						overallRequestStatus:{						
							requestStatus:{
								requestStatusValue:'Pending',
								queuePosition:1},
							statusInfo:'Some text'		
						},
						floorRequestStatus:[{						
							requestStatus:{
								requestStatusValue:'foo',
								queuePosition:2
							},
							statusInfo:'More text'
						}]					
					}
				}
		};				
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}		
	}
	log();
	ok(chairAction3(),"ChairAction - no  floorRequestStatus.floorId " + 
			" wrong value for floorRequestStatus.requestStatus.requestStatusValue " + 
			" no floorRequestId " + 
			" no overallRequestStatus.floorRequestId");	
	
	
	function chairAction4()
	{
		json = {		
				ver:1,
				primitive:'ChairAction',
				transactionId:43,
				conferenceId:76,	
				userId:98,
				attributes: {
					floorRequestInformation: {					
						floorRequestId:123,
						overallRequestStatus:{
							floorRequestId:456,
							requestStatus:{
								requestStatusValue:'Pending',
								queuePosition:1},
							statusInfo:'Some text'		
						},
						floorRequestStatus:[{						
							requestStatus:{
								requestStatusValue:'Granted',
								queuePosition:2
							},
							statusInfo:'More text'
						}],
						beneficiaryInformation:{
							beneficiaryId:77,
							userDisplayName:'Paco Garcia',
							userUri:'http://www.example.com'	
						},
						requestedByInformation:{
							requestedById:'99',
							userDisplayName:'Paco Romero',
							userUri:'http://www.myexample.com'
						},
						priority:'Normal',
						participantProvidedInfo:'A little more of text'	
					}
				}
		};		
		try
		{
			protocol.sendPacket(json);
			return false;
		}
		catch(e)
		{
			return isInstanceOf(e,JsFCP.Exceptions.InvalidMessageFormat);			
		}
	}
	log();
	ok(chairAction4(),"ChairAction - NO floorRequestInformation.floorRequestStatus[0].floorId ");
	
	
});

//*****************************************************************
//*****************************************************************
//*****************************************************************


test( 'Protocol - Send Messages', function() {
	console.log ('\n\t Protocol Messages: \n');
	var i = 0;
		
	function log()
	{
		console.log("\n Test number " + ++i);
	}
		
	function testIsWebSocketReady()
	{	
		return protocol.isWebSocketReady();			
	}
	log();
	ok(testIsWebSocketReady(),"isWebSocketReady");
	
	function testFloorRequest(){
				
		floorId =  [4,5,6];
		beneficiaryID = 456;
		participantProviderInfo = "Verifying participantProviderInfo";
		priority = 'Low';			
		console.log('\n'+"... Testing ... requestFloor(all)");
		
		return protocol.requestFloor(floorId, beneficiaryID,priority,participantProviderInfo,null);
 	}
	log();
	ok(testFloorRequest(),"testFloorRequest - all - ok");
	
	function testFloorRequest2(){
		
		floorId =  7;
		beneficiaryID = 456;
		participantProviderInfo = "Verifying participantProviderInfo";
		priority = 'Low';			
		console.log('\n'+"... Testing ... requestFloor(all)");
		
		try{		
			protocol.requestFloor(floorId, beneficiaryID,priority,participantProviderInfo,null);
			return false;
		}
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		}
 	}
	log();
	ok(testFloorRequest2()," FloorRequest with single floorId (no Array) -> Exception");
	
	function testFloorRequest3(){
		
		floorId =  [4,5];
				
		return protocol.requestFloor(floorId);
 	}
	log();
	ok(testFloorRequest3()," FloorRequest -> only [floorId]");
	
	function testFloorRequest4(){
						
		try{		
			protocol.requestFloor();
			return false;
		}
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		}
 	}
	log();
	ok(testFloorRequest4()," FloorRequest with no floorId arg -> Exception");
	
	
	function testQueryFloorRequest(){			
 		pFloorRequestId = 1;	
		return protocol.queryFloorRequest(pFloorRequestId);
	}
	log();
	ok(testQueryFloorRequest()," QueryFloorRequest - ok");
	
	function testQueryFloorRequest2(){	
		try{ 		
			protocol.queryFloorRequest();
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		}
	}
	log();
	ok(testQueryFloorRequest2()," QueryFloorRequest - no FloorId -> Exception");
	
	
	function testFloorRelease1(){
 		pFloorRequestId = 1;			
 		return protocol.releaseFloor(pFloorRequestId);		 		
	}	
	log();
	ok(testFloorRelease1()," FloorRelease - ok");
	
		
	function testFloorRelease2(){
 		pFloorRequestId = [1];			
 		 		
 		try{ 		
			protocol.releaseFloor(pFloorRequestId);	
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		}
	}	
	log();
	ok(testFloorRelease2()," FloorRelease - wrong pFloorRequestId format (array)");
		
	
	function testFloorRelease3(){ 			
		try{ 		
			protocol.releaseFloor();	
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		} 		
	}	
	log();
	ok(testFloorRelease3()," FloorRelease - pFloorRequestId empty");
	
	
	function testChairAction1()
	{
		json = {						
								
			floorRequestId:123,					
			floorRequestStatus:[{
				floorId:'67',
				requestStatus:{
					requestStatusValue:'Granted',
					queuePosition:2
				},
				statusInfo:'More text'
			}],		
		};	
		return protocol.chairAction(json);
	}
	log();
	ok(testChairAction1()," ChairAction - ok");
	
	
	function testChairAction2()
	{
		json = {						
								
			floorRequestId:123,					
			floorRequestStatus:[{				
				requestStatus:{
					requestStatusValue:'Granted',
					queuePosition:2
				},
				statusInfo:'More text'
			}],		
		};
		try{ 		
			protocol.chairAction();
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		} 	
	}
	log();
	ok(testChairAction2()," ChairAction - no floorRequestStatus.floorId");
	
	
	function testChairAction3()
	{
		json = {	
			floorRequestStatus:[{				
				requestStatus:{
					requestStatusValue:'Granted',
					queuePosition:2
				},
				statusInfo:'More text'
			}],		
		};	
		try{ 		
			protocol.chairAction();
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		} 	
	}
	log();
	ok(testChairAction3()," ChairAction - no floorRequestStatus.floorId, " + 
			" no floorRequestStatus.floorRequestId");
	
	
	function testQueryFloor1()
	{
		floorId = [4,5,6];
		return protocol.queryFloor(floorId);
	}
	log();
	ok(testQueryFloor1()," QueryFloor - ok");
	
	
	function testQueryFloor2()
	{
		floorId = 5;
		
		try{ 		
			protocol.queryFloor(floorId);
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		} 	
	}
	log();
	ok(testQueryFloor2()," QueryFloor - wrong floorId format (not array)");
	
	
	
	function testQueryFloor3()
	{			
		try{ 		
			protocol.queryFloor();
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		} 	
	}
	log();
	ok(testQueryFloor3()," QueryFloor - no floorId");
	
	
	function testQueryUser1()
	{
		return protocol.queryUser();
	}
	log();
	ok(testQueryUser1()," QueryUser - ok");
	
	
	function testQueryUser2()
	{
		var beneficiaryId = 7;
		return protocol.queryUser(beneficiaryId);
	}
	log();
	ok(testQueryUser2()," QueryUser - with beneficiaryId - ok");
	
	
	function testQueryUser3()
	{
		var beneficiaryId = [7];
				
		try{ 		
			protocol.queryUser(beneficiaryId);
			return false;
		}		
		catch(e)
		{
			if (e instanceof JsFCP.Exceptions.InvalidMessageFormat)
			{ 
				return true;
			}
			else
			{
				return false;
			}
		} 		
	}
	log();
	ok(testQueryUser3()," QueryUser - wrong beneficiaryId format (array)");
	
		
	function testRequestFloorControlCapabilities()
	{
		return protocol.requestFloorControlCapabilities();
	}
	log();
	ok(testRequestFloorControlCapabilities()," RequestFloorControlCapabilities - ok");
	
});
	
		
	 	  
	  
