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

## `gulp` commands

### `$ gulp dist`

Generates two "browserified" libraries, both of them exposing the global `window.JsFCP` namespace:

* `dist/jsfcp-X.Y.Z.js`: The uncompressed version.
* `dist/jsfcp-X.Y.Z.min.js`: The minified production-ready version.

### `$ gulp test`

*TODO:* to be done.

Runs test units.


## Browserified standalone library

Copy the uncompressed or compressed version into your web tree and load it as usual:

    <script src='js/jsfcp-X.Y.Z.min.js'></script>

    <script>
        var participant = new JsFCP.Participant(conferenceId, userId, ws_uri, floorIds);
    </script>

### Debugging

By default the library logs nothing to the browser console. JsFCP includes the Node [debug](https://github.com/visionmedia/debug) module, exposed via `JsFCP.debug`.

In order to enable debugging, run the following command in the browser console and reload the page:

    > JsFCP.debug.enable('JsFCP*');

Note that the logging settings get stored into the browser LocalStorage. To disable it:

    > JsFCP.debug.disable('JsFCP*');

In order to enable it by default, add the following after the `<script>` tag:

    <script src='js/jsfcp-X.Y.Z.min.js'></script>
    <script>JsFCP.debug.enable('JsFCP:*');</script>


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

Again, JsFCP includes the Node [debug](https://github.com/visionmedia/debug) module. In order to enable debugging set the `DEBUG` environment variable as follows before running your Node script/command:

    export DEBUG='JsFCP*'


## Documentation

Read the full [API documentation](docs/index.md) in the *docs* folder.
