const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  uploadPhoto
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);

module.exports = router;
