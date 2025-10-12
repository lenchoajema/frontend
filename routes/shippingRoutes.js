const express = require('express');
const router = express.Router();
const { authenticate: auth } = require('../middleware/auth');
const Order = require('../models/Order');

// Note: This is a stub implementation. In production, integrate with:
// - ShipEngine (https://www.shipengine.com/)
// - EasyPost (https://www.easypost.com/)
// - Shippo (https://goshippo.com/)

// @route   POST /api/shipping/rates
// @desc    Get shipping rates for an address
// @access  Private
router.post('/rates', auth(), async (req, res) => {
    // Manual validation
    if (!req.body.address || typeof req.body.address !== 'object') {
      return res.status(400).json({ message: 'Address is required and must be an object' });
    }
    if (!req.body.address.street || req.body.address.street.trim() === '') {
      return res.status(400).json({ message: 'Street is required' });
    }
    if (!req.body.address.city || req.body.address.city.trim() === '') {
      return res.status(400).json({ message: 'City is required' });
    }
    if (!req.body.address.state || req.body.address.state.trim() === '') {
      return res.status(400).json({ message: 'State is required' });
    }
    if (!req.body.address.zipCode || req.body.address.zipCode.trim() === '') {
      return res.status(400).json({ message: 'ZIP code is required' });
    }
    if (!req.body.address.country || req.body.address.country.trim() === '') {
      return res.status(400).json({ message: 'Country is required' });
    }
    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    try {
      const { address, items } = req.body;

      // Calculate total weight (stub - in production, get from product data)
      const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);

      // Stub shipping rates - in production, call ShipEngine/EasyPost API
      const rates = [
        {
          id: 'standard',
          carrier: 'USPS',
          service: 'Standard Shipping',
          deliveryDays: '5-7 business days',
          rate: 5.99,
          currency: 'USD',
        },
        {
          id: 'expedited',
          carrier: 'FedEx',
          service: 'Expedited Shipping',
          deliveryDays: '2-3 business days',
          rate: 12.99,
          currency: 'USD',
        },
        {
          id: 'express',
          carrier: 'FedEx',
          service: 'Express Overnight',
          deliveryDays: '1 business day',
          rate: 24.99,
          currency: 'USD',
        },
      ];

      // Adjust rates based on weight
      const adjustedRates = rates.map(rate => ({
        ...rate,
        rate: rate.rate + (totalWeight > 5 ? (totalWeight - 5) * 0.5 : 0),
      }));

      res.json({
        rates: adjustedRates,
        destination: address,
        totalWeight: totalWeight,
      });
    } catch (error) {
      console.error('Get shipping rates error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/shipping/create-label
// @desc    Create a shipping label for an order
// @access  Private (Seller/Admin only)
router.post('/create-label/:orderId', auth(), async (req, res) => {
    // Manual validation
    if (!req.params.orderId || !req.params.orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!req.body.rateId || req.body.rateId.trim() === '') {
      return res.status(400).json({ message: 'Rate ID is required' });
    }

    try {
      // Check authorization (seller or admin)
      if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to create shipping labels' });
      }

      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // In production, call ShipEngine API to create label
      // const shipEngineResponse = await shipEngine.createLabel({...});

      // Stub response
      const trackingNumber = `1Z${Math.random().toString(36).substr(2, 16).toUpperCase()}`;
      const labelUrl = `https://example.com/labels/${trackingNumber}.pdf`;

      // Update order with tracking info
      order.trackingNumber = trackingNumber;
      order.trackingUrl = labelUrl;
      order.shippingCarrier = 'USPS';
      order.shippingService = 'Standard Shipping';
      order.status = 'shipped';
      order.shippedAt = new Date();
      
      await order.save();

      res.json({
        message: 'Shipping label created successfully',
        trackingNumber,
        labelUrl,
        order: {
          id: order._id,
          status: order.status,
          trackingNumber: order.trackingNumber,
        },
      });
    } catch (error) {
      console.error('Create label error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/shipping/track/:trackingNumber
// @desc    Get tracking information for a shipment
// @access  Public
router.get('/track/:trackingNumber', async (req, res) => {
    // Manual validation
    if (!req.params.trackingNumber || req.params.trackingNumber.trim() === '') {
      return res.status(400).json({ message: 'Tracking number is required' });
    }

    try {
      // In production, call carrier API or ShipEngine tracking API
      // const trackingInfo = await shipEngine.trackPackage(req.params.trackingNumber);

      // Stub tracking data
      const trackingInfo = {
        trackingNumber: req.params.trackingNumber,
        carrier: 'USPS',
        status: 'in_transit',
        statusDescription: 'In Transit',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        events: [
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: 'label_created',
            description: 'Shipping label created',
            location: 'Los Angeles, CA',
          },
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'picked_up',
            description: 'Package picked up by carrier',
            location: 'Los Angeles, CA',
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            status: 'in_transit',
            description: 'In transit to destination',
            location: 'Phoenix, AZ',
          },
        ],
      };

      res.json(trackingInfo);
    } catch (error) {
      console.error('Track shipment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/shipping/validate-address
// @desc    Validate a shipping address
// @access  Public
router.post('/validate-address', async (req, res) => {
    // Manual validation
    if (!req.body.address || typeof req.body.address !== 'object') {
      return res.status(400).json({ message: 'Address is required and must be an object' });
    }
    if (!req.body.address.street || req.body.address.street.trim() === '') {
      return res.status(400).json({ message: 'Street is required' });
    }
    if (!req.body.address.city || req.body.address.city.trim() === '') {
      return res.status(400).json({ message: 'City is required' });
    }
    if (!req.body.address.state || req.body.address.state.trim() === '') {
      return res.status(400).json({ message: 'State is required' });
    }
    if (!req.body.address.zipCode || req.body.address.zipCode.trim() === '') {
      return res.status(400).json({ message: 'ZIP code is required' });
    }
    if (!req.body.address.country || req.body.address.country.trim() === '') {
      return res.status(400).json({ message: 'Country is required' });
    }

    try {
      const { address } = req.body;

      // In production, use USPS Address Validation API or similar
      // const validatedAddress = await usps.validateAddress(address);

      // Stub validation - assume address is valid
      const validatedAddress = {
        ...address,
        valid: true,
        suggestions: [],
      };

      res.json({
        original: address,
        validated: validatedAddress,
        isValid: validatedAddress.valid,
      });
    } catch (error) {
      console.error('Validate address error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/shipping/carriers
// @desc    Get list of supported carriers
// @access  Public
router.get('/carriers', (req, res) => {
  const carriers = [
    { id: 'usps', name: 'USPS', logo: '/carriers/usps.png' },
    { id: 'fedex', name: 'FedEx', logo: '/carriers/fedex.png' },
    { id: 'ups', name: 'UPS', logo: '/carriers/ups.png' },
    { id: 'dhl', name: 'DHL', logo: '/carriers/dhl.png' },
  ];

  res.json({ carriers });
});

module.exports = router;
