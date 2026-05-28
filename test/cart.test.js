const Cart = require('../models/cart');

describe('Cart Model - Add & Quantity Logic', () => {
    
    // Test 1: First item in the cart
    test('Should correctly add a completely new item to the cart', () => {
        const cart = new Cart({});
        const dummyProduct = { id: 'prod1', title: 'Apple', price: 1.50 };

        cart.add(dummyProduct, dummyProduct.id);

        expect(cart.totalItems).toBe(1);
        expect(cart.items['prod1']).toBeDefined();
        expect(cart.items['prod1'].quantity).toBe(1);
        expect(cart.items['prod1'].item.title).toBe('Apple');
    });

    // Test 2: Increasing quantity for the same item
    test('Should increment the quantity when the same item is added twice', () => {
        const cart = new Cart({});
        const dummyProduct = { id: 'prod1', title: 'Apple', price: 1.50 };

        cart.add(dummyProduct, dummyProduct.id);
        cart.add(dummyProduct, dummyProduct.id);

        expect(cart.totalItems).toBe(2);
        expect(cart.items['prod1'].quantity).toBe(2);
        // Verify that there is still only one unique product key in the cart
        expect(Object.keys(cart.items).length).toBe(1);
    });

    // Test 3: Adding two different items
    test('Should create separate keys for two different items', () => {
        const cart = new Cart({});
        const prod1 = { id: 'prod1', title: 'Apple', price: 1.50 };
        const prod2 = { id: 'prod2', title: 'Banana', price: 2.00 };

        cart.add(prod1, prod1.id);
        cart.add(prod2, prod2.id);

        expect(cart.totalItems).toBe(2);
        expect(cart.items['prod1']).toBeDefined();
        expect(cart.items['prod2']).toBeDefined();
        expect(Object.keys(cart.items).length).toBe(2);
    });

    // Test 4: Initialization with an existing cart
    test('Should correctly reconstruct a cart from a previous session object', () => {
        const oldCartSession = {
            items: {
                'prod1': { quantity: 3, price: 4.50, item: { id: 'prod1', title: 'Apple', price: 1.50 } }
            },
            totalItems: 3,
            totalPrice: 4.50
        };

        const cart = new Cart(oldCartSession);

        expect(cart.totalItems).toBe(3);
        expect(cart.totalPrice).toBe(4.50);
        expect(cart.items['prod1'].quantity).toBe(3);
    });

    // Test 5: Edge Case - Incomplete product data
    test('Should handle a product with missing required fields robustly', () => {
        const cart = new Cart({});
        const brokenProduct = { id: 'prod_broken', title: 'Broken Item' }; // Price is missing!

        cart.add(brokenProduct, brokenProduct.id);

        expect(cart.totalItems).toBe(1);
        expect(cart.items['prod_broken']).toBeDefined();
        // The model calculates 'undefined * 1', resulting in NaN.
        // We assert this to document the current model behavior accurately.
        expect(cart.totalPrice).toBeNaN();
    });
});