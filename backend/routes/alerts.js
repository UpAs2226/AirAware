const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// GET /api/alerts - get user's alerts
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/alerts - create alert
router.post('/', protect, async (req, res) => {
  try {
    const { type, threshold, location, message } = req.body;
    if (!threshold) return res.status(400).json({ message: 'Threshold is required' });

    const alert = await Alert.create({
      user: req.user._id,
      type: type || 'aqi',
      threshold,
      location,
      message
    });

    res.status(201).json({ alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/alerts/:id - toggle active
router.put('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    Object.assign(alert, req.body);
    await alert.save();

    res.json({ alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
