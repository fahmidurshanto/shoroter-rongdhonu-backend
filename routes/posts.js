const router = require('express').Router();
let Post = require('../models/post.model');
const auth = require('../middleware/auth');

// Get all posts (publicly accessible, with search, filter, and pagination)
router.route('/').get(async (req, res) => {
  const { search, tag, page = 1, limit = 10 } = req.query;
  let query = { isDraft: false }; // Only show published posts by default

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  if (tag) {
    query.tags = tag;
  }

  try {
    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ posts, totalPosts, currentPage: parseInt(page), totalPages: Math.ceil(totalPosts / limit) });
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get a single post by ID (publicly accessible)
router.route('/:id').get((req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new post (protected route)
router.route('/add').post(auth, (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const featuredImage = req.body.featuredImage;
  const tags = req.body.tags;
  const isDraft = req.body.isDraft || false;
  const publishedAt = req.body.isDraft ? null : Date.now(); // Set publishedAt only if not a draft

  const newPost = new Post({
    title,
    content,
    featuredImage,
    tags,
    isDraft,
    publishedAt,
  });

  newPost.save()
    .then(() => res.json('Post added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update an existing post (protected route)
router.route('/update/:id').post(auth, (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      post.title = req.body.title;
      post.content = req.body.content;
      post.featuredImage = req.body.featuredImage;
      post.tags = req.body.tags;
      post.isDraft = req.body.isDraft;
      // Update publishedAt if it's being published from a draft
      if (!req.body.isDraft && post.isDraft) {
        post.publishedAt = Date.now();
      } else if (req.body.isDraft) {
        post.publishedAt = null; // Clear publishedAt if it's a draft
      }

      post.save()
        .then(() => res.json('Post updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a post (protected route)
router.route('/delete/:id').delete(auth, (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => res.json('Post deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get total post count
router.route('/count/total').get(auth, (req, res) => {
  Post.countDocuments()
    .then(count => res.json({ count }))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get draft post count
router.route('/count/drafts').get(auth, (req, res) => {
  Post.countDocuments({ isDraft: true })
    .then(count => res.json({ count }))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get published post count
router.route('/count/published').get(auth, (req, res) => {
  Post.countDocuments({ isDraft: false })
    .then(count => res.json({ count }))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get latest published posts (publicly accessible)
router.route('/latest').get((req, res) => {
  const limit = parseInt(req.query.limit) || 3; // Default to 3 latest posts
  Post.find({ isDraft: false })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;