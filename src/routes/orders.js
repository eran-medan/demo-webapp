const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { validateOrder } = require('../utils/validators');

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    const validation = validateOrder(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      notes,
      shippingCost: 9.99,
    });

    order.calculateTotal();
    await order.save();

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    logger.info(`Order ${order._id} created by user ${req.user._id}`);
    res.status(201).json(order);
  } catch (error) {
    logger.error(`Order creation error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', authenticate, async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate('items.product', 'name description')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.get('/:id', authenticate, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .populate('items.product', 'name description price');

  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.patch('/:id/cancel', authenticate, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
  }

  order.status = 'cancelled';
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  logger.info(`Order ${order._id} cancelled`);
  res.json(order);
});

router.get('/admin/all', authenticate, authorize('admin'), async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('items.product', 'name')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.patch('/admin/:id/status', authenticate, authorize('admin'), async (req, res) => {
  const { status, trackingNumber, estimatedDelivery } = req.body;

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped'],
    shipped: ['delivered'],
  };

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({ error: `Cannot transition from ${order.status} to ${status}` });
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  await order.save();

  logger.info(`Order ${order._id} status updated to ${status}`);
  res.json(order);
});

module.exports = router;
