const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  authorEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
