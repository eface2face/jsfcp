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

    $ grunt dist

It generates two libraries, both of them exposing the global `window.JsFCP` namespace:

* `build/jsfcp-X.Y.Z.js`: The uncompressed version.
* `build/jsfcp-X.Y.Z.min.js`: The minified production-ready version.

It also generates a soft link `build/jsfcp-last.js` pointing to the uncompressed version.


## Usage in the browser

Copy the browserified and minified version into your web tree and load it as usual:

    <script src='js/jsfcp-X.Y.Z.min.js'></script>

    <script>
        var participant = new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds);
    </script>


## Usage in Node.js

Add the module to the `dependencies` field within the `package.json` file of your Node project:

    "dependencies": {
      "jsfcp": "git+ssh://git@git.assembla.com:jsfcp.git"
    }

**NOTE:** You need an already set SSH key as Git authentication mechanism.

And load it as usual:

    var JsFCP = require('jsfcp');

    var participant = new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds);


## API

### JsFCP.Participant

The main class. It represents a peer that connects via WebSocket to the BFCP server to send and receive BFCP messages.

#### new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds)

Parameters:
* `conferenceId` {Integer}: The conference id.
* `userId` {Integer}: The user id.
* `ws_uri` {String}: The WebSocket URI.
* `floorIds`{Array<Integer>}: Array of floor ids.

#### requestFloor(events, floorIds, beneficiaryId=null, priority=null, participantProvidedInfo=null)

Request one or varios floors.

Parameters:
* `events` {Object}: Object with the desired callbacks:
  * `pending` {Function}: Called when the FloorRequest gets "Pending" status.
  * `accepted` {Function}: Called when the FloorRequest gets "Accepted" status.
  * `granted` {Function}: Called when the FloorRequest gets "Granted" status.
  * `deined` {Function}: Called when the FloorRequest gets "Denied" status. The FloorRequest has terminated.
  * `cancelled` {Function}: Called when the FloorRequest gets "Cancelled" status (which means that the user has released it before owning it). The FloorRequest has terminated.
  * `released` {Function}: Called when the FloorRequest gets "Released" status (which means that the user or other participant in his behalf has released it). The FloorRequest has terminated.
  * `revoked` {Function}: Called when the FloorRequest gets a "Revoked" status (which means that the server has revoked the floor). The FloorRequest has terminated.
  * `error` {Function}: Called when something was wrong with the FloorRequest (may be a BFCP error, JS error, connection error...).
* `floorIds`{Array<Integer>}: The requested floor Ids. The method raises an error if at least one of the floors does not match the list of `floorIds` provided to the `Participant` construtor).
* `beneficiaryId` {Integer}: The id of the beneficiary for the requested floors (when it is not the same user as the participant).
* `participantProvidedInfo` {Object}: Additional information about the participant (*TODO:* what?).

Returns: An instance of `JsFCP.FloorRequest`.
