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

    // Test 5: Edge Case - try to add incomplete product data
    test('Should not add a product with missing required fields', () => {
        const cart = new Cart({});
        const brokenProduct = { id: 'prod_broken', title: 'Broken Item' }; // Price is missing!

        cart.add(brokenProduct, brokenProduct.id);

        expect(cart.totalItems).toBe(0);
    });
});

describe('Cart Model - Pricecalculation & Remove Logic', () => {

    // Test 6: Total Cost - Correct price calculated
    test('Should correctly calculate the total price of the cart', () => {
        const cart = new Cart({});
        const prod1 = { id: 'prod1', title: 'Apple', price: 1.50 };
        const prod2 = { id: 'prod2', title: 'Banana', price: 2.00 };

        cart.add(prod1, prod1.id);
        cart.add(prod2, prod2.id);

        expect(cart.totalPrice).toBe(3.50);
    });

    // Test 7: Floating Point - Correct price calculated
    test('Should correctly handle floating point errors in the total price calculation', () => {
        const cart = new Cart({});
        const prod1 = { id: 'prod1', title: 'Apple', price: 9.99 };
        const prod2 = { id: 'prod2', title: 'Banana', price: 9.99 };
        const prod3 = { id: 'prod3', title: 'Orange', price: 9.99 };

        cart.add(prod1, prod1.id);
        cart.add(prod2, prod2.id);
        cart.add(prod3, prod3.id);

        expect(cart.totalPrice).toBe(29.97);
    });

    // Test 8: Remove Item - Correctly removes an item completely from the cart
    test('Should correctly remove an item from the cart', () => {
        const cart = new Cart({});
        const prod1 = { id: 'prod1', title: 'Apple', price: 1.50 };

        cart.add(prod1, prod1.id);
        expect(cart.totalItems).toBe(1);

        cart.remove(prod1.id);
        expect(cart.totalItems).toBe(0);
        expect(cart.totalPrice).toBe(0);
        expect(cart.items[prod1.id]).toBeUndefined();
    });

    // Test 9: Get Items - Correctly returns an array of cart items
    test('Should correctly return all items in the cart as an array', () => {
        const cart = new Cart({});
        const prod1 = { id: 'prod1', title: 'Apple', price: 1.50 };
        const prod2 = { id: 'prod2', title: 'Banana', price: 2.00 };

        cart.add(prod1, prod1.id);
        cart.add(prod2, prod2.id);

        const itemsArray = cart.getItems();

        expect(Array.isArray(itemsArray)).toBe(true);
        expect(itemsArray.length).toBe(2);
        expect(itemsArray[0].item.title).toBeDefined();
    });

    // Test 10: Empty Cart Initialization - Verify defaults
    test('Should initialize an empty cart with default zeroed values', () => {
        const cart = new Cart({});
        expect(cart.totalItems).toBe(0);
        expect(cart.totalPrice).toBe(0);
        expect(Object.keys(cart.items).length).toBe(0);
        expect(cart.getItems().length).toBe(0);
    });

    // Test 11: Remove non-existing item - Should not throw an error - Test fails so model must be improved
    test('Should not throw any error so removal function is not resilient', () => {
        const cart = new Cart({});
        expect(() => {
            cart.remove('non-existing');
        }).not.toThrow();
    });

});