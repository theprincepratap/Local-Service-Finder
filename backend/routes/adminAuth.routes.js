const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/admin/login', adminAuthController.adminLogin);
router.post('/admin/forgotpassword', adminAuthController.adminForgotPassword);
router.post('/admin/resetpassword/:resettoken', adminAuthController.adminResetPassword);

// Protected routes (require authentication)
router.use(protect);
router.use(authorize('admin', 'super-admin', 'moderator'));

router.get('/admin/me', adminAuthController.getAdminMe);
router.put('/admin/updatedetails', adminAuthController.updateAdminDetails);
router.put('/admin/updatepassword', adminAuthController.updateAdminPassword);
router.get('/admin/activity-log', adminAuthController.getAdminActivityLog);

module.exports = router;
