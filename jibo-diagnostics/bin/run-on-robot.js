// Run jibo-ssm's launch API (dev) for diagnostics skill
'use strict';

const http = require('http');
const body = JSON.stringify({
    command: 'jibo-diagnostics'
});

const options = {
    host: '127.0.0.1',
    port: 8779,
    path: '/launch-dev',
    method: 'POST',
    headers: {
        'Accept': 'application/json, text/javascript, */*;',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': body.length
    }
};

const request = http.request(options, function(response) {

    let data = '';
    response.on('data', function(chunk) {
        data += chunk;
    });

    response.on('end', function(){
        if (response.statusCode === 200) {
            console.log('DONE? ');
        }
        else {
            console.log('BAD THINGS');
        }
    });
});

request.on('error', function(e) {
    console.log('Problem running diagnostics: ' + e.message);
});

request.write(body);
request.end();