# JsFCP

JavaScript [BFCP](http://tools.ietf.org/html/rfc4582) client implementation using WebSocket as transport and JSON as message format.

Runs in both the browser and Node.js.


## Installation

[Node.js](http://nodejs.org) must be installed.

Install `gulp-cli` 4.0 globally (which provides the `gulp` command):

    $ npm install -g gulpjs/gulp-cli#4.0

Get the source code:

    $ git clone git@git.assembla.com:ef2f-js.jsfcp.git jsfcp
    $ cd jsfcp/

Install dependencies:

    $ npm install


## Usage in Node.js

Add the module to the `dependencies` field within the `package.json` file of your Node project:

    "dependencies": {
      "jsfcp": "git+ssh://git@git.assembla.com:ef2f-js.jsfcp.git#X.Y.Z"
    }

**NOTE:** You need an already set SSH key as Git authentication mechanism.

And load it as usual:

    var JsFCP = require('jsfcp');

    var participant = new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds);


### Debugging

JsFCP includes the Node [debug](https://github.com/visionmedia/debug) module. In order to enable debugging set the `DEBUG` environment variable as follows before running your Node script/command:

    export DEBUG='JsFCP*'


## Documentation

Read the full [API documentation](docs/index.md) in the *docs* folder.
