'use strict';

const fs = require('fs');

const pjson = require('../package.json');
const program = require('commander');
const colors = require('colors');
const prompt = require('prompt');
const mongoUriBuilder = require('mongo-uri-builder');

program
.version(pjson.version)
.option('-f, --file [value]', 'Set json file with your settings')
.parse(process.argv);

console.log('[info]'.cyan, 'starting get-mongo-uri');

function getConnectionString(data) {
  try {
    var connectionString = mongoUriBuilder(data); 
    console.log('\n[success]'.green, connectionString);
  }
  catch (ex) {
    console.log('[error]'.red, ex);
  }
}

module.exports.start = function() {
  if (program.file) {
    if (typeof program.file !== 'string'){
      return console.log('[error]'.red, 'invalid -f (--file) parametter.');
    }

    fs.readFile(program.file, 'utf-8', (err, data) => {
      if (err) {
        console.log('[error]'.red, err);
        return;
      }
      getConnectionString(JSON.parse(data));
    });
  }
  else {
    console.log('[info]'.cyan, 'Please insert your mongodb settings:\n');

    prompt.get(['username', 'password', 'host', 'port', 'database'], (err, results) => {
      getConnectionString(results);
    });
  }
};