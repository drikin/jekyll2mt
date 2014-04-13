// Parse input file which expects Jekyll markdown
var opts = require('opts');
opts.parse([
  {
    'short': 'i',
    'long': 'input',
    'description': 'input file',
    'value': true,
    'required': true
  },
]);
var filename = opts.get('input');


// Load input file
function loadFile(fname) {
  var fs = require('fs');
  var ret = fs.readFileSync(fname, 'utf8');
  return ret;
}

// MT operation
var MT_DATA_API_URL = 'XXXXX';
var MT_USER         = 'XXXXX';
var MT_PASSWORD     = 'XXXXX';

function makeEntry(fname) {
  var path = require('path');

  // basename from filename w/ stripping ext and date
  var basename = path.basename(fname);
  var extname = path.extname(basename);
  basename = basename.replace(extname, '');
  basename = basename.replace(/\d{4}-\d{2}-\d{2}-/, '');

  var text = loadFile(fname);

  // get Title
  var head = text.match(/^---[\s\S]*---/);
  if (head) {
    var title = head[0].match(/title:\s*['"](.*)['"]/);
    if (title) {
      title = title[1];
    }
  }

  // get Body
  var entry = text.replace(head, '');
  entry = entry.replace(/^\s*/, '');

  var entryArray = entry.split('\n');
  var l = entryArray.length;
  if (entryArray.length > 3) {
    l = 3;
  }
  var body = '';
  for (var i = 0; i < l; i++) {
    body += entryArray[i] + '\n';
  }

  var more = entry.replace(body, '');

  return {
    status: 'draft',
      title: title,
      body: body,
      more: more,
      basename: basename
  }
}
var MT = {
  DataAPI: require("mt-data-api-sdk")
};
var api = new MT.DataAPI({
  baseUrl:  MT_DATA_API_URL,
    clientId: "node"
});
var credential = {
  username: MT_USER,
  password: MT_PASSWORD,
  remember: true
}
var entryData = makeEntry(filename);
// Session information will be stored to "$HOME/.mt-data-api.json" by default.
api.authenticate(credential, function(response) {
  if (!response.error) {
    api.createEntry(2, entryData, function(response) {
      console.log(response);
    });
  }
});

//vim: tabstop=2 shiftwidth=2 textwidth=0 expandtab foldmethod=marker nowrap
