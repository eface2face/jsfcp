# JsFCP

JavaScript [BFCP](http://tools.ietf.org/html/rfc4582) client implementation using WebSocket as transport and JSON as message format.

Runs in both the browser and Node.js.


## Development

Node.js must be installed. `grunt-cli` must be globally installed:

    $ npm install -g grunt-cli

Install dependencies:

    $ npm install

Run test units:

*TODO:* to be done

    $ grunt test


### Browserified library

    $ grunt bundle

It generates two libraries, both of them exposing the global `window.JsFCP` namespace:

* `bundles/jsfcp-X.Y.Z.js`: The uncompressed version.
* `bundles/jsfcp-X.Y.Z.min.js`: The minified production-ready version.

It also generates a soft link `bundles/jsfcp-last.js` pointing to the uncompressed version.


## Usage in the browser

Copy the minified version into your web tree and load it as usual:

    <script src='js/jsfcp-X.Y.Z.min.js'></script>

    <script>
        var participant = new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds);
    </script>

### Debugging

By default the library logs nothing to the browser console. JsFCP includes the Node [debug](https://github.com/visionmedia/debug) module, exposed via `JsFCP.debug`.

In order to enable debugging, run the following command in the browser console and reload the page:

    > JsFCP.debug.enable('JsFCP:*');

Note that the logging settings get stored into the browser LocalStorage. To disable it:

    > JsFCP.debug.disable('JsFCP:*');

In order to enable it by default, add the following after the `<script>` tag:

    <script src='js/jsfcp-X.Y.Z.min.js'></script>
    <script>JsFCP.debug.enable('JsFCP:*');</script>

## Usage in Node.js

Add the module to the `dependencies` field within the `package.json` file of your Node project:

    "dependencies": {
      "jsfcp": "git+ssh://git@git.assembla.com:ef2f-js.jsfcp.git#0.1.0"
    }

**NOTE:** You need an already set SSH key as Git authentication mechanism.

And load it as usual:

    var JsFCP = require('jsfcp');

    var participant = new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds);

### Debugging

Again, JsFCP includes the Node [debug](https://github.com/visionmedia/debug) module. In order to enable debugging set the `DEBUG` environment variable as follows before running your Node script/command:

    export DEBUG='JsFCP:*'


## API

### JsFCP.Participant

The main class. It represents a peer that connects via WebSocket to the BFCP server to send and receive BFCP messages.

#### new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds)

Parameters:

* `conferenceId` {Integer}: The conference id.
* `userId` {Integer}: The user id.
* `ws_uri` {String}: The WebSocket URI.
* `floorIds` {Array(Integer)}: Array of floor ids.

#### Attributes

* `conferenceId` {Integer}: The conference id.
* `userId` {Integer}: The user id.

#### requestFloor(events, floorIds, beneficiaryId=null, priority=null, participantProvidedInfo=null)

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

#### release(events, floorRequest)

Release (or cancel) a previous call to `requestFloor()`.

Parameters:

* `events` {Object}: Object with the desired callbacks:
  * `error` {Function(e))}: Called when something was wrong.
    * `e` {Object}: Object with two fields:
      * `errorCode` {String}: Error identifier.
      * `errorInfo` {String}: Error text description.
* `floorRequest` {JsFCP.FloorRequest|Integer}: The instance of `FloorRequest` or its numeric id to be cancelled or released.

#### Event 'connected'

Fired when the WebSocket is connected.

#### Event 'disconnected'

Fired when the WebSocket is disconnected.

#### Event 'floorGranted'

Fired when a floor has been granted to a beneficiary user.

Parameters:

* `data` {Object}: Object with these fields:
  * `floorId` {Integer}: The floor being granted.
  * `beneficiaryId` {Integer}: The current owner of the floor.
  * `floorRequestId`: The identifier of the FloorRequest that obtained the floor (useful for thirdy-party FloorRelease by calling the `release()` method).

#### Event 'floorReleased'

Fired when a floor has been released and nobody owns it at this moment.

Parameters:

* `data` {Object}: Object with these fields:
  * `floorId` {Integer}: The floor being released.
  * `beneficiaryId` {Integer}: The previous owner of the floor.
  * `floorRequestId`: The identifier of the FloorRequest that obtained the floor.


### Usage example

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
