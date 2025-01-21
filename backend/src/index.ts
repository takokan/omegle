import express from 'express'
import { WebSocketServer } from 'ws';

const app = express();
const httpServer = app.listen(8080)

const wss = new WebSocketServer({server: httpServer});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});