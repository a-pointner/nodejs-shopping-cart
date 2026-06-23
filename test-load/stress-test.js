import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {

  stages: [
    { duration: '30s', target: 400 },
    { duration: '30s', target: 800 },
    { duration: '30s', target: 1200 },
    { duration: '30s', target: 1600 },
    { duration: '30s', target: 2000 },
    { duration: '30s', target: 2400 },
    { duration: '30s', target: 2800 },
    { duration: '30s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = 'http://localhost:3000';
const PRODUCT_ID = 1;


export default function () {
  // Open the home page
  const home = http.get(`${BASE_URL}/`);
  check(home, { 'home status is 200': (r) => r.status === 200 });

  // Add a product to the cart (302 redirect, not the followed page)
  const add = http.get(`${BASE_URL}/add/${PRODUCT_ID}`, { redirects: 0 });
  check(add, { 'add redirects (302)': (r) => r.status === 302 });

  // View the cart
  const cart = http.get(`${BASE_URL}/cart`);
  check(cart, { 'cart status is 200': (r) => r.status === 200 });

  // Remove the product again
  const remove = http.get(`${BASE_URL}/remove/${PRODUCT_ID}`, { redirects: 0 });
  check(remove, { 'remove redirects (302)': (r) => r.status === 302 });

  sleep(1); // think time
}
