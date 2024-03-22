import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
// import { Counter } from 'k6/metrics';
// const count = new Counter('count-send');

const sessionDuration = randomIntBetween(10000, 60000);

export const options = {
  // default
  // gracefulRampDown:"30s",
  // rps:20,
  stages: [
    { duration: '1m', target: 450 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 10 },
    { duration: '10s', target: 0 },
    // { duration: '1m', target: 20 },
    // { duration: '5m', target: 100 },
  ],
  thresholds: {
    'checks{wsTag:ws101}': ['rate>1'],
    //checks: ['rate>1'],
  }
};

export default function () {
  const url = '';
  const params = {
    tags: { k6test: 'k6_yes' },
  };
  let rand = (Math.random() * 100000000000000000).toString();

  const res = ws.connect(url, params, function (socket) {

    socket.on('open', function open() {
      console.log('connected');
      socket.send('{"protocol":"json","version":1}\x1e');

      socket.setInterval(function timeout() {
        socket.send(JSON.stringify({
          "type": 1,
          "invocationId": rand,
          "target": "sendMessage",
          "arguments": 
            [{
              "LineUserId": "",
              "Text":"k6 :" + rand,
              "ParentMessageId":0,
              "SendType":0
            }]
        })+'\x1e');
      }, randomIntBetween(2000, 5000)); // say something every 2-8seconds
    });

    socket.on('message', (data) => console.log('Message received: ', data)); 

    socket.on('error', function (e) {
      if (e.error() != 'websocket: close sent') {
        console.log('An unexpected error occured: ', e.error());
      }
    });

    socket.setTimeout(function () {
      console.log(`VU ${__VU}: ${sessionDuration}ms passed, leaving the chat`);
    }, sessionDuration);

    socket.setTimeout(function () {
      console.log(`Closing the socket forcefully 3s after graceful LEAVE`);
      socket.close();
    }, sessionDuration + 3000);
    
  });

  check(
    res, 
    { 'status is 101': (r) => r && r.status === 101 },
    { wsTag: 'ws101' });
}