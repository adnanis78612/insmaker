const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    req.session.user = { id: user._id, username: user.username };
    res.redirect('/feed');
  } catch (e) {
    console.error(e);
    res.redirect('/signup');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.redirect('/login');
  const ok = await user.comparePassword(password);
  if (!ok) return res.redirect('/login');
  req.session.user = { id: user._id, username: user.username };
  res.redirect('/feed');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
