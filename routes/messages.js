const router = require('express').Router();
const Message = require('../models/message.model');
const auth = require('../middleware/auth');

// Submit a new reader message (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ msg: 'Name, email, and message are required.' });
    }

    const newMessage = new Message({
      name: name.trim(),
      email: email.trim(),
      subject: subject ? subject.trim() : '',
      message: message.trim(),
    });

    await newMessage.save();
    res.status(201).json({ msg: 'Message sent successfully! Thank you for writing.' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to send message', error: err.message });
  }
});

// Get all messages for admin (Protected)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch messages', error: err.message });
  }
});

// Mark message as read (Protected)
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update message', error: err.message });
  }
});

// Delete message (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.json({ msg: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete message', error: err.message });
  }
});

module.exports = router;
