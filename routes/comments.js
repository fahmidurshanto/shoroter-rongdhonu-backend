const router = require('express').Router();
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const auth = require('../middleware/auth');

// Get approved comments for a specific post (Public)
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, isApproved: true })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch comments', error: err.message });
  }
});

// Post a new comment (Public reader)
router.post('/post/:postId', async (req, res) => {
  try {
    const { authorName, authorEmail, content } = req.body;
    if (!authorName || !content) {
      return res.status(400).json({ msg: 'Name and comment are required.' });
    }

    const postExists = await Post.findById(req.params.postId);
    if (!postExists) {
      return res.status(404).json({ msg: 'Post not found.' });
    }

    const newComment = new Comment({
      post: req.params.postId,
      authorName: authorName.trim(),
      authorEmail: authorEmail ? authorEmail.trim() : '',
      content: content.trim(),
      isApproved: true, // auto-approved by default
    });

    await newComment.save();
    res.status(201).json({ msg: 'Comment posted successfully!', comment: newComment });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to post comment', error: err.message });
  }
});

// Get all comments for admin review (Protected)
router.get('/', auth, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('post', 'title')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch all comments', error: err.message });
  }
});

// Delete a comment (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.json({ msg: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete comment', error: err.message });
  }
});

module.exports = router;
