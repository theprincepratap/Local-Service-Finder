const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// All admin routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard - Coming soon' });
});

router.get('/users', (req, res) => {
  res.json({ success: true, message: 'Get all users - Coming soon' });
});

router.get('/workers', (req, res) => {
  res.json({ success: true, message: 'Get all workers - Coming soon' });
});

router.put('/workers/:id/verify', (req, res) => {
  res.json({ success: true, message: 'Verify worker - Coming soon' });
});

router.get('/bookings', (req, res) => {
  res.json({ success: true, message: 'Get all bookings - Coming soon' });
});

router.get('/analytics', (req, res) => {
  res.json({ success: true, message: 'Get analytics - Coming soon' });
});

module.exports = router;
