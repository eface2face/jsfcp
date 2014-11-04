# JsFCP

JavaScript [BFCP](http://tools.ietf.org/html/rfc4582) client implementation using WebSocket as transport and JSON as message format.

Runs in both the browser and Node.js.


## Development

Node.js must be installed. `grunt-cli` must be globally installed:

<pre><code>
$ npm install -g grunt-cli
</code></pre>

Install dependencies:

<pre><code>
$ npm install
</code></pre>

Run test units:

*TODO:* to be done

<pre><code>
$ grunt test
</code></pre>

### Browserified library

<pre><code>
$ grunt
</code></pre>

It generates two libraries, both of them exposing the global `window.JsFCP` namespace:

* `build/jsfcp-X.Y.Z.js`: The uncompressed version.
* `build/jsfcp-X.Y.Z.min.js`: The minified production-ready version.

It also generates a soft link `build/jsfcp-last.js` pointing to the uncompressed version.


## Usage in the browser

Copy the browserified and minified version into your web tree and load it as usual:

<pre><code>
<script src='js/jsfcp-X.Y.Z.min.js'></script>

<script>
    var participant = new JsFCP.Participant(conferenceId, userId, wss, floors);
</script>
</code></pre>


## Usage in Node.js

Add the module to the `dependencies` field within the `package.json` file of your Node project:

<pre><code>
"dependencies": {
  "jsfcp": "git+ssh://git@git.assembla.com:jsfcp.git"
}
</code></pre>

**NOTE:** You need an already set SSH key as Git authentication mechanism.

And load it as usual:

<pre><code>
var JsFCP = require('jsfcp');

var participant = new JsFCP.Participant(conferenceId, userId, wss, floors);
</code></pre>
