const { validateOrder } = require('../src/utils/validators');

describe('Order Validation', () => {
  const validOrder = {
    items: [{ productId: '507f1f77bcf86cd799439011', quantity: 2 }],
    shippingAddress: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
    },
    paymentMethod: 'credit_card',
  };

  test('accepts valid order', () => {
    expect(validateOrder(validOrder)).toEqual({ valid: true });
  });

  test('rejects order without items', () => {
    const result = validateOrder({ ...validOrder, items: [] });
    expect(result.valid).toBe(false);
  });

  test('rejects order without shipping address', () => {
    const result = validateOrder({ ...validOrder, shippingAddress: undefined });
    expect(result.valid).toBe(false);
  });

  test('rejects order with invalid payment method', () => {
    const result = validateOrder({ ...validOrder, paymentMethod: 'bitcoin' });
    expect(result.valid).toBe(false);
  });

  test('rejects items with zero quantity', () => {
    const result = validateOrder({
      ...validOrder,
      items: [{ productId: '507f1f77bcf86cd799439011', quantity: 0 }],
    });
    expect(result.valid).toBe(false);
  });
});
