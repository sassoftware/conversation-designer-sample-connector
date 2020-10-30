/*!
 * Copyright © 2020, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const path = require('path');

let indexRouter = require('../routes/index');

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../')));

app.use('/', indexRouter);

module.exports = app;