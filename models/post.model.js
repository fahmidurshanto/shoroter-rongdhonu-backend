const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  featuredImage: { type: String },
  tags: [{ type: String }],
  isDraft: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, {
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;