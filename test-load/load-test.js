import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // ramp-up
    { duration: '2m', target: 500 },   // hold: constant load of 50 users
    { duration: '30s', target: 0 },   // ramp-down: 50 -> 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // less than 1% of requests may fail
    http_req_duration: ['p(95)<500'], // 95% of requests must be under 500ms
  },
};

const BASE_URL = 'http://localhost:3000';
const PRODUCT_ID = 1;

export default function () {
  // Open the home page
  const home = http.get(`${BASE_URL}/`);
  check(home, { 'home status is 200': (r) => r.status === 200 });

  // Add product to cart
  const add = http.get(`${BASE_URL}/add/${PRODUCT_ID}`, { redirects: 0 });
  check(add, { 'add redirects (302)': (r) => r.status === 302 });

  // View the cart
  const cart = http.get(`${BASE_URL}/cart`);
  check(cart, { 'cart status is 200': (r) => r.status === 200 });

  // Remove the product again
  const remove = http.get(`${BASE_URL}/remove/${PRODUCT_ID}`, { redirects: 0 });
  check(remove, { 'remove redirects (302)': (r) => r.status === 302 });

  sleep(1); // think time between iterations
}
