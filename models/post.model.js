const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  contentType: {
    type: String,
    enum: ['poem', 'theatre', 'article', 'thought'],
    default: 'poem',
  },
  featuredImage: { type: String, trim: true },
  audioUrl: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  isDraft: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  viewsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  publishedAt: { type: Date },
}, {
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
