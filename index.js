const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
});

const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const messagesRouter = require('./routes/messages');

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/messages', messagesRouter);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'শরতের রংধনু — মোর্শেদ সাকিব সাহিত্য পোর্টাল API সচল রয়েছে।',
    version: '2.0.0'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
