const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

router.put('/me', authenticate, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ['name', 'email'];
  const isValid = updates.every(update => allowed.includes(update));

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  updates.forEach(update => req.user[update] = req.body[update]);
  await req.user.save();
  res.json(req.user);
});

module.exports = router;
