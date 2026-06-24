const request = require('supertest');
const app = require('../app');
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8'));
const validProduct = products[0];

describe('Integration Tests - Express Routes & Session Flow', () => {

    // =========================================================================
    // Core Infrastructure & Read Routes (Catalog & Views)
    // =========================================================================

    // Test 1: Catalog View
    test('GET / should fetch products from JSON and render homepage', async () => {
        const response = await request(app).get('/');
        
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('NodeJS Shopping Cart');
        expect(response.text).toContain(validProduct.title);
    });

    // Test 2: Initial Cart View (Empty)
    test('GET /cart should render empty state text when no session exists', async () => {
        const response = await request(app).get('/cart');
        
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Your shopping cart is empty.');
    });

    // Test 3: Active Cart View (Populated)
    test('GET /cart should dynamically render items stored in session (add)', async () => {
        const agent = request.agent(app); // hold the session
        
        await agent.get(`/add/${validProduct.id}`);
        
        const response = await agent.get('/cart');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain(validProduct.title);
        expect(response.text).toContain(`Total: ${validProduct.price}`);
    });

    // Test 4: Active Cart View (Empty)
    test('GET /cart should dynamically render items stored in session (remove)', async () => {
        const agent = request.agent(app);
        
        await agent.get(`/add/${validProduct.id}`);
        await agent.get(`/remove/${validProduct.id}`);
        
        const response = await agent.get('/cart');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Your shopping cart is empty.');
    });


    // =========================================================================
    // State Mutations & Error Boundaries (Add, Remove & Edge Cases)
    // =========================================================================

    // Test 5: Mutation via Addition
    test('GET /add/:id should mutate session state and redirect to /', async () => {
        const agent = request.agent(app);
        
        const response = await agent.get(`/add/${validProduct.id}`);
        
        expect(response.statusCode).toBe(302);
        expect(response.headers['location']).toBe('/');
        expect(response.headers['set-cookie']).toBeDefined();
    });

    // Test 6: Mutation via Removal
    test('GET /remove/:id should mutate session state and redirect to /cart', async () => {
        const agent = request.agent(app);
        
        await agent.get(`/add/${validProduct.id}`);
        
        const response = await agent.get(`/remove/${validProduct.id}`);
        
        expect(response.statusCode).toBe(302);
        expect(response.headers['location']).toBe('/cart');
    });

    // Test 7: Edge Case (Invalid Payload/ID)
    test('GET /add/999 with non-existent ID should throw an internal server error', async () => {
        const response = await request(app).get('/add/999');
        
        expect(response.statusCode).toBe(500);
        // It would be better if the server handled such cases more effectively and
        // does not return a 5xx error code.
    });

    // Test 8: Edge Case (Invalid Payload/ID)
    test('GET /remove/999 with non-existent ID should throw an internal server error', async () => {
        const response = await request(app).get('/remove/999');
        
        expect(response.statusCode).toBe(500);
        // It would be better if the server handled such cases more effectively and
        // does not return a 5xx error code.
    });

    // Test 9: Edge Case (Removal without existing item/cart)
    test('GET /remove/:id when item is not in cart should throw an internal server error due to missing checks', async () => {
        const response = await request(app).get(`/remove/${validProduct.id}`);
        
        expect(response.statusCode).toBe(500);
        // It would be better if the server handled such cases more effectively and
        // does not return a 5xx error code.
    });
});