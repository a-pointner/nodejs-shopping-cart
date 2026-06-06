const router = require('../routes/index');

/**
 * Helper function to extract a specific route handler from the Express router stack.
 * Since we are not using Supertest, we need to access the internal 'stack' of the router
 * to get the actual function (handler) that processes the request.
 * 'router.stack' is an internal Express array containing all defined routes.
 */
function getHandler(path, method = 'get') {
    const route = router.stack.find(s => s.route && s.route.path === path && s.route.methods[method]);
    return route.route.stack[0].handle;
}

describe('Endpoint Integration Tests (Without Supertest)', () => {
    let req, res, next;

    /**
     * Set up mocks before each test. 
     * 'jest.fn()' creates mock functions that allow us to track calls and arguments.
     * We use these to simulate the 'res.render' and 'res.redirect' methods of Express.
     */
    beforeEach(() => {
        req = {
            params: {},
            session: {}
        };
        res = {
            render: jest.fn(),
            redirect: jest.fn(),
            locals: {}
        };
        next = jest.fn();
    });

    // Test 1: Index Page
    test('Index Handler should render "index" with products from JSON', () => {
        const handler = getHandler('/');
        handler(req, res, next);

        // Verify that res.render was called with the correct view name and data
        expect(res.render).toHaveBeenCalledWith('index', expect.objectContaining({
            title: 'NodeJS Shopping Cart',
            products: expect.any(Array)
        }));

        // Verify that the data contains real product info (e.g., Apples)
        const renderArgs = res.render.mock.calls[0][1];
        expect(renderArgs.products[0].title).toBe('Apples');
    });

    // Test 2: Add Product (Redirect & Session Initialization)
    test('Add Handler should create a cart in session and redirect to /', () => {
        const handler = getHandler('/add/:id');
        req.params.id = '1'; // Simulate adding Apples

        handler(req, res, next);

        // Verify redirection and session updates
        expect(res.redirect).toHaveBeenCalledWith('/');
        expect(req.session.cart).toBeDefined();
        expect(req.session.cart.totalItems).toBe(1);
        expect(req.session.cart.totalPrice).toBe(25);
    });

    // Test 3: Increment Quantity (Route + Session Integration)
    test('Add Handler should increment quantity in existing session', () => {
        const handler = getHandler('/add/:id');
        req.params.id = '1';
        
        // Simulate a session that already contains one item
        req.session.cart = {
            items: { '1': { item: { id: 1, price: 25 }, quantity: 1, price: 25 } },
            totalItems: 1,
            totalPrice: 25
        };

        handler(req, res, next);

        // Verify that the existing item was updated correctly
        expect(req.session.cart.totalItems).toBe(2);
        expect(req.session.cart.items['1'].quantity).toBe(2);
        expect(req.session.cart.totalPrice).toBe(50);
    });
});
