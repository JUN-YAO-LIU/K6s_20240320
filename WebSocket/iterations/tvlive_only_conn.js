import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import ws from 'k6/ws';
import { check } from 'k6';
// import { Counter } from 'k6/metrics';
// const count = new Counter('count-send');

const sessionDuration = randomIntBetween(10 * 1000,60 * 1000);

export const options = {
  // discardResponseBodies: true,
  // default
  gracefulRampDown: "0s",
  // rps:20,
  startVUs: 0,
  vus:1,
  iterations: 5,
  // duration: "1m",
  thresholds: {
    // 'checks{wsTag:ws101}': ['rate>1'],
    // checks: ['rate>1'],
  }
};

export default function () {
  const url = 'wss://tvlive.ehsn.com.tw/hub/chat?aid=1&access_token=eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiVWJjZTc2ZTBkMjZhNDA3YTIyN2ZlMzdmNjI0NWZhYzNjIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJVYmNlNzZlMGQyNmE0MDdhMjI3ZmUzN2Y2MjQ1ZmFjM2MiLCJzdWIiOiJVYmNlNzZlMGQyNmE0MDdhMjI3ZmUzN2Y2MjQ1ZmFjM2MiLCJqdGkiOiJlOWIwN2M4Ni05NWUzLTQ3NDAtOTZmNC01MjJiM2FiNmU1Y2EiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDdXN0b21lciIsImNpZCI6MTM2LCJleHAiOjE3MTA5NTE3NzcsImlzcyI6InBRNVVDam1UbDRua1VscjZqZlNrIn0.WCSW_-kpqNXSfMb55kxq3vQQZijFa-Ul0rzO_eIpMOw';
  const params = {
    tags: { k6test: 'k6_yes' },
  };

  const res = ws.connect(url, null, function (socket) {

    socket.on('open', function open() {
      console.log('connected');
      socket.send('{"protocol":"json","version":1}\x1e');
    });

    // socket.on('message', (data) => console.log('Message received: ', data)); 

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
      { 'status is 101': (r) => r && r.status === 101 });
}