const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/dist/web-chat-client'));

app.listen(process.env.PORT || 8080);

app.get('/*', function(request, response) {
  response.sendFile(path.join(__dirname + '/dist/web-chat-client/index.html'));
});