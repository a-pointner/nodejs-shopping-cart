import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '5s', target: 200 },
    { duration: '15s', target: 200 },
    { duration: '5s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}