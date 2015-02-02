# `Participant` API

The main class. It represents a peer that connects via WebSocket to the BFCP server to send and receive BFCP messages.

### `new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds)`

Parameters:

* `conferenceId` {Integer}: The conference id.
* `userId` {Integer}: The user id.
* `ws_uri` {String}: The WebSocket URI.
* `floorIds` {Array(Integer)}: Array of floor ids.


## Properties

* `conferenceId` {Integer}: The conference id.
* `userId` {Integer}: The user id.


## Methods

### `requestFloor(events, floorIds, beneficiaryId=null, priority=null, participantProvidedInfo=null)`

Request one or varios floors.

Parameters:

* `events` {Object}: Object with the desired callbacks:
  * `pending` {Function}: Called when the FloorRequest gets "Pending" status. Parameters:
    * `floorRequest` {JsFCP.FloorRequest}: The instance of the `JsFCP.FloorRequest`.
  * `accepted` {Function}: Called when the FloorRequest gets "Accepted" status. Parameters:
    * `floorRequest` {JsFCP.FloorRequest}: The instance of the `JsFCP.FloorRequest`.
  * `granted` {Function}: Called when the FloorRequest gets "Granted" status. Parameters:
    * `floorRequest` {JsFCP.FloorRequest}: The instance of the `JsFCP.FloorRequest`.
  * `denied` {Function}: Called when the FloorRequest gets "Denied" status. The FloorRequest has terminated.
  * `cancelled` {Function}: Called when the FloorRequest gets "Cancelled" status (which means that the user has released it before owning it). The FloorRequest has terminated.
  * `released` {Function}: Called when the FloorRequest gets "Released" status (which means that the user or other participant in his behalf has released it). The FloorRequest has terminated.
  * `revoked` {Function}: Called when the FloorRequest gets a "Revoked" status (which means that the server has revoked the floor). The FloorRequest has terminated.
  * `error` {Function}: Called when something was wrong. The FloorRequest has terminated. Parameters:
    * `e` {Object}: Object with two fields:
      * `errorCode` {String}: Error identifier.
      * `errorInfo` {String}: Error text description.
* `floorIds` {Array(Integer)}: The requested floor Ids. The method raises an error if at least one of the floors does not match the list of `floorIds` provided to the `Participant` construtor).
* `beneficiaryId` {Integer}: The id of the beneficiary for the requested floors (when it is not the same user as the participant).
* `participantProvidedInfo` {Object}: Additional information about the participant (*TODO:* what?).

Returns: An instance of `JsFCP.FloorRequest`.


### `release(events, floorRequest)` 

Release (or cancel) a previous call to `requestFloor()`.

Parameters:

* `events` {Object}: Object with the desired callbacks:
  * `error` {Function(e))}: Called when something was wrong.
    * `e` {Object}: Object with two fields:
      * `errorCode` {String}: Error identifier.
      * `errorInfo` {String}: Error text description.
* `floorRequest` {JsFCP.FloorRequest|Integer}: The instance of `FloorRequest` or its numeric id to be cancelled or released.


### `close()` 

Closes the WebSocket transport. Will emit "disconnected".


## Events

The `Participant` class inherints the methods of the Node's [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).


### "connected" event

Fired when the WebSocket is connected.


### "disconnected" event

Fired when the WebSocket is disconnected.

Parameters:

* `data` {Object}: Object with these fields:
  * `local` {Boolean}: `true` if `close()` was called. Otherwise (`false`) means unsolicited WebSocket server disconnection or network error.


### "floorGranted" event

Fired when a floor has been granted to a beneficiary user.

Parameters:

* `data` {Object}: Object with these fields:
  * `floorId` {Integer}: The floor being granted.
  * `beneficiaryId` {Integer}: The current owner of the floor.
  * `floorRequestId`: The identifier of the FloorRequest that obtained the floor (useful for thirdy-party FloorRelease by calling the `release()` method).


#### "floorReleased" event

Fired when a floor has been released and nobody owns it at this moment.

Parameters:

* `data` {Object}: Object with these fields:
  * `floorId` {Integer}: The floor being released.
  * `beneficiaryId` {Integer}: The previous owner of the floor.
  * `floorRequestId`: The identifier of the FloorRequest that obtained the floor.


## Usage example

    var conferenceId = 1234;
    var userId = 10;
    var floorIds = [1, 2];
    var ws_uri = "wss://dev.ef2f.com/bfcp/" + conferenceId + "/" + userId;

    var participant = new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds);
    
    participant.on('floorGranted', function(data) {
      alert('Floor ' + data.floorId + ' with floorRequestId=' + data.floorRequestId + ' is now owned by user ' + data.beneficiaryId);
    });
    
    participant.on('floorReleased', function(data) { 
     alert('Floor ' + data.floorId + ' now is owned by nobody');
    });
    
    // The user clicks the button to get the Presenter floor:
    
    $('#floorPresenterButton').click(function() {
      // First disable the button.
      xxxxxxxx
    
      var events = {
        granted: function(floorRequest) {
          alert('I've got the floor. Now I will release it !!!');
          participant.release({}, floorRequest);
        },
        denied: function() {
          alert('The BFCP server denied me the floor');
        },
        released: function() {
          alert('I have released the floor');
        },
        revoked: function() {
          alert('The BFCP server has revoked my floor so I no longer own it');
        },
        cancelled: function() {
          alert('I've cancelled the floor request before obtaining it');
        },
        error: function(e) {
          alert('some error has ocurred | code: ' + e.errorCode + ', description: ' + e.errorInfo);
        }
      };
    
      // And finally send the floor request to the server.
      participant.requestFloor(events, [1]);
    });
