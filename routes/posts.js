const router = require('express').Router();
const Post = require('../models/post.model');
const auth = require('../middleware/auth');

// Get all posts (publicly accessible with search, tag, category, pagination)
router.get('/', async (req, res) => {
  const { search, tag, category, page = 1, limit = 10, status } = req.query;
  let query = {};

  // If status is specifically requested (e.g. 'all' or 'draft' from dashboard)
  if (status === 'draft') {
    query.isDraft = true;
  } else if (status === 'all') {
    // Show both
  } else {
    // Default to published only
    query.isDraft = false;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  if (tag) {
    query.tags = tag;
  }

  if (category) {
    query.contentType = category;
  }

  try {
    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      posts,
      totalPosts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / parseInt(limit)) || 1,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch posts', error: err.message });
  }
});

// Get featured poem/post
router.get('/featured', async (req, res) => {
  try {
    let post = await Post.findOne({ isDraft: false, isFeatured: true }).sort({ publishedAt: -1 });
    if (!post) {
      post = await Post.findOne({ isDraft: false }).sort({ publishedAt: -1 });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch featured post', error: err.message });
  }
});

// Get latest published posts
router.get('/latest', async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  const category = req.query.category;
  let query = { isDraft: false };
  if (category) {
    query.contentType = category;
  }

  try {
    const posts = await Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch latest posts', error: err.message });
  }
});

// Get counts for dashboard
router.get('/count/total', auth, async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error getting total count', error: err.message });
  }
});

router.get('/count/drafts', auth, async (req, res) => {
  try {
    const count = await Post.countDocuments({ isDraft: true });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error getting draft count', error: err.message });
  }
});

router.get('/count/published', auth, async (req, res) => {
  try {
    const count = await Post.countDocuments({ isDraft: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error getting published count', error: err.message });
  }
});

// Like a post (Public reader action)
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json({ likesCount: post.likesCount });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to like post', error: err.message });
  }
});

// Record a view (Public reader action)
router.post('/:id/view', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json({ viewsCount: post.viewsCount });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to record view', error: err.message });
  }
});

// Add a new post (Protected)
router.post('/add', auth, async (req, res) => {
  try {
    const { title, content, contentType, featuredImage, audioUrl, tags, isDraft, isFeatured } = req.body;
    const isDraftBool = Boolean(isDraft);

    const newPost = new Post({
      title,
      content,
      contentType: contentType || 'poem',
      featuredImage: featuredImage || '',
      audioUrl: audioUrl || '',
      tags: Array.isArray(tags) ? tags : [],
      isDraft: isDraftBool,
      isFeatured: Boolean(isFeatured),
      publishedAt: isDraftBool ? null : Date.now(),
    });

    await newPost.save();
    res.status(201).json({ msg: 'Post added successfully!', post: newPost });
  } catch (err) {
    res.status(400).json({ msg: 'Failed to add post', error: err.message });
  }
});

// Update an existing post (Protected)
router.post('/update/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const { title, content, contentType, featuredImage, audioUrl, tags, isDraft, isFeatured } = req.body;
    const isDraftBool = Boolean(isDraft);

    post.title = title || post.title;
    post.content = content || post.content;
    post.contentType = contentType || post.contentType;
    post.featuredImage = featuredImage !== undefined ? featuredImage : post.featuredImage;
    post.audioUrl = audioUrl !== undefined ? audioUrl : post.audioUrl;
    post.tags = Array.isArray(tags) ? tags : post.tags;
    post.isFeatured = isFeatured !== undefined ? Boolean(isFeatured) : post.isFeatured;

    // Manage publishedAt when toggling draft
    if (!isDraftBool && post.isDraft) {
      post.publishedAt = Date.now();
    } else if (isDraftBool) {
      post.publishedAt = null;
    }
    post.isDraft = isDraftBool;

    await post.save();
    res.json({ msg: 'Post updated successfully!', post });
  } catch (err) {
    res.status(400).json({ msg: 'Failed to update post', error: err.message });
  }
});

// Delete a post (Protected)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json({ msg: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete post', error: err.message });
  }
});

// Get a single post by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(400).json({ msg: 'Invalid post ID or error', error: err.message });
  }
});

module.exports = router;
