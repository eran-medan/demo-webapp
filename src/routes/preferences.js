const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getAvailableThemes, getTheme } = require('../config/themes');

const router = express.Router();

// TODO: persist to database - currently in-memory only
const userPreferences = new Map();

router.get('/themes', (req, res) => {
  res.json(getAvailableThemes());
});

router.get('/theme/:name', (req, res) => {
  const theme = getTheme(req.params.name);
  if (!theme) return res.status(404).json({ error: 'Theme not found' });
  res.json(theme);
});

router.get('/', authenticate, (req, res) => {
  const prefs = userPreferences.get(req.user._id.toString()) || {
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
  };
  res.json(prefs);
});

router.put('/', authenticate, (req, res) => {
  const { theme, fontSize, compactMode } = req.body;
  // TODO: validate theme name against available themes
  const prefs = {
    theme: theme || 'light',
    fontSize: fontSize || 'medium',
    compactMode: compactMode || false,
  };
  userPreferences.set(req.user._id.toString(), prefs);
  res.json(prefs);
});

module.exports = router;
