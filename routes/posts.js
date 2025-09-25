const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

router.get('/feed', async (req, res) => {
  const posts = await Post.find({}).populate('author').sort({ createdAt: -1 }).limit(50);
  res.render('feed', { posts });
});

router.get('/create', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('create');
});

router.post('/create', upload.single('image'), async (req, res) => {
  const { caption } = req.body;
  let imageUrl = '/images/default.png';
  if (req.file) imageUrl = '/uploads/' + req.file.filename;
  await Post.create({ author: req.session.user.id, caption, imageUrl });
  res.redirect('/feed');
});

module.exports = router;
