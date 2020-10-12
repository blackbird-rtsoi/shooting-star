const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const routes = require('./routes/routes.js')(app, fs);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(3000, () => {
    console.log('listneing on port %s...', server.address().port);
});