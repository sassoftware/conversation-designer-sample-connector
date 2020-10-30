#!/usr/bin/env node

/*!
 * Copyright © 2020, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

let app = require('./javascript/app');
let http = require('http');

let port = '3000';
app.set('port', port);

let server = http.createServer(app);

server.listen(port);
server.on('listening', onListening);

function onListening() {
  console.log('Running. Visit: http://localhost:3000');
}
