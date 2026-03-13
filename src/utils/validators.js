const validateOrder = (data) => {
  const { items, shippingAddress, paymentMethod } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'At least one item is required' };
  }

  for (const item of items) {
    if (!item.productId) {
      return { valid: false, error: 'Each item must have a productId' };
    }
    if (!item.quantity || item.quantity < 1) {
      return { valid: false, error: 'Each item must have a positive quantity' };
    }
  }

  if (!shippingAddress) {
    return { valid: false, error: 'Shipping address is required' };
  }

  const requiredFields = ['street', 'city', 'state', 'zipCode'];
  for (const field of requiredFields) {
    if (!shippingAddress[field]) {
      return { valid: false, error: `Shipping address ${field} is required` };
    }
  }

  const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return { valid: false, error: 'Invalid payment method' };
  }

  return { valid: true };
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain an uppercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Password must contain a number' };
  return { valid: true };
};

module.exports = { validateOrder, validateEmail, validatePassword };
