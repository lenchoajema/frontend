const express = require('express');
const router = express.Router();
const { authenticate: auth } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');

// @route   POST /api/gdpr/export-data
// @desc    Export all user data (GDPR compliance)
// @access  Private
router.post('/export-data', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Gather all user data
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price')
      .lean();
    
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.product', 'name price')
      .lean();

    const userData = {
      personalInformation: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      orders: orders.map(order => ({
        orderId: order._id,
        date: order.createdAt,
        status: order.status,
        totalPrice: order.totalPrice,
        items: order.items,
        shippingAddress: order.shippingAddress,
      })),
      wishlist: wishlist ? wishlist.items : [],
      consents: {
        cookieConsent: user.cookieConsent || {},
        marketingConsent: user.marketingConsent || false,
        dataProcessingConsent: user.dataProcessingConsent || true,
      },
      exportDate: new Date().toISOString(),
    };

    res.json({
      message: 'Data export successful',
      data: userData,
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gdpr/delete-account
// @desc    Request account deletion (GDPR right to be forgotten)
// @access  Private
router.post('/delete-account', auth(), async (req, res) => {
    // Manual validation
    if (!req.body.password || req.body.password.trim() === '') {
      return res.status(400).json({ message: 'Password is required for account deletion' });
    }
    if (req.body.confirmDeletion !== 'DELETE') {
      return res.status(400).json({ message: 'Please type DELETE to confirm' });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Check for pending orders
      const pendingOrders = await Order.find({
        user: req.user.id,
        status: { $in: ['pending', 'processing', 'shipped'] },
      });

      if (pendingOrders.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete account with pending orders. Please wait for orders to complete or contact support.',
          pendingOrders: pendingOrders.length,
        });
      }

      // Instead of immediate deletion, mark account for deletion
      // This allows for a grace period (e.g., 30 days)
      user.deletionRequested = true;
      user.deletionRequestedAt = new Date();
      user.deletionScheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      user.isActive = false;
      await user.save();

      res.json({
        message: 'Account deletion scheduled',
        scheduledFor: user.deletionScheduledFor,
        gracePeriodDays: 30,
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/gdpr/cancel-deletion
// @desc    Cancel account deletion request
// @access  Private
router.post('/cancel-deletion', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.deletionRequested) {
      return res.status(400).json({ message: 'No deletion request found' });
    }

    user.deletionRequested = false;
    user.deletionRequestedAt = null;
    user.deletionScheduledFor = null;
    user.isActive = true;
    await user.save();

    res.json({ message: 'Account deletion cancelled successfully' });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/gdpr/consent
// @desc    Update user consent preferences
// @access  Private
router.put('/consent', auth(), async (req, res) => {
    // Manual validation
    if (req.body.cookieConsent !== undefined && typeof req.body.cookieConsent !== 'object') {
      return res.status(400).json({ message: 'cookieConsent must be an object' });
    }
    if (req.body.marketingConsent !== undefined && typeof req.body.marketingConsent !== 'boolean') {
      return res.status(400).json({ message: 'marketingConsent must be a boolean' });
    }
    if (req.body.dataProcessingConsent !== undefined && typeof req.body.dataProcessingConsent !== 'boolean') {
      return res.status(400).json({ message: 'dataProcessingConsent must be a boolean' });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.body.cookieConsent !== undefined) {
        user.cookieConsent = req.body.cookieConsent;
      }
      if (req.body.marketingConsent !== undefined) {
        user.marketingConsent = req.body.marketingConsent;
      }
      if (req.body.dataProcessingConsent !== undefined) {
        user.dataProcessingConsent = req.body.dataProcessingConsent;
      }

      await user.save();

      res.json({
        message: 'Consent preferences updated',
        consents: {
          cookieConsent: user.cookieConsent,
          marketingConsent: user.marketingConsent,
          dataProcessingConsent: user.dataProcessingConsent,
        },
      });
    } catch (error) {
      console.error('Update consent error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/gdpr/consent
// @desc    Get user consent preferences
// @access  Private
router.get('/consent', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cookieConsent marketingConsent dataProcessingConsent');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      cookieConsent: user.cookieConsent || {},
      marketingConsent: user.marketingConsent || false,
      dataProcessingConsent: user.dataProcessingConsent || true,
    });
  } catch (error) {
    console.error('Get consent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gdpr/data-portability
// @desc    Generate data portability file (JSON format)
// @access  Private
router.post('/data-portability', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.product');

    const portableData = {
      format: 'JSON',
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registeredAt: user.createdAt,
      },
      orders: orders,
      wishlist: wishlist,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${user._id}.json"`);
    res.json(portableData);
  } catch (error) {
    console.error('Data portability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
