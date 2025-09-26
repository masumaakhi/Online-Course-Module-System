// routes/paymentRoutes.js
const express = require('express');
const { userAuth } = require('../middleware/userAuth');
const {
  createStripeCheckout,
  confirmStripeSession,
  sslInit,
  sslSuccess,
  sslFail,
  sslIpn,
} = require('../controllers/paymentController');

const router = express.Router();

// Stripe
router.post('/stripe/checkout', userAuth, createStripeCheckout);
// webhook টা app-level এ server.js এ raw body সহ রাখা থাকুক
router.post('/stripe/confirm', userAuth, confirmStripeSession);

// SSLCommerz
router.post('/ssl/init', userAuth, sslInit);
router.post('/ssl/success', sslSuccess);
router.post('/ssl/fail', sslFail);
router.post('/ssl/ipn', sslIpn);

module.exports = router;
