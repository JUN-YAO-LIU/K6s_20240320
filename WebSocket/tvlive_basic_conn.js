import ws from 'k6/ws';
import { check } from 'k6';

export default function () {
  const url = '';
  const params = { tags: { my_tag: 'hello' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      socket.send('{"protocol":"json","version":1}\x1e')
    });
    socket.on('message', (data) => console.log('Message received: ', data)); 
    socket.on('close', () => console.log('closed'));
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}