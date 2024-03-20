import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 },
   // { duration: '1m', target: 20 }
  ]
};

export default function () {
  const url = '';
  const params = { tags: { my_tag: 'hello' } };
  const sendMag = '{LineUserId:"",Text:"dd",ParentMessageId:0,SendType:0}';
  let rand = (Math.random() * 100000000000000000).toString();

  const res = ws.connect(url, null, function (socket) {

    socket.on('open', function open() {
      console.log('connected');
      socket.send('{"protocol":"json","version":1}\x1e');

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
    });

    socket.on('message', (data) => console.log('Message received: ', data)); 

    socket.on('error', function (e) {
      if (e.error() != 'websocket: close sent') {
        console.log('An unexpected error occured: ', e.error());
      }
    });
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}