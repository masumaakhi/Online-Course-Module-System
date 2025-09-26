// controllers/paymentController.js

const Stripe = require('stripe');
const SSLCommerz = require('sslcommerz-lts');
const enrollmentModel = require('../models/enrollmentModel');
const courseModel = require('../models/courseModel');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

// ---------- helpers ----------
const getCourseOr400 = async (courseId, res) => {
  const course = await courseModel.findById(courseId).lean();
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' });
    return null;
  }
  if (course.status !== 'published') {
    res.status(400).json({ success: false, message: 'Course is not published' });
    return null;
  }
  if (course.pricing?.plan !== 'paid' || (course.pricing?.price || 0) <= 0) {
    res.status(400).json({ success: false, message: 'Course is not paid' });
    return null;
  }
  return course;
};

const upsertEnrollmentPaid = async ({ courseId, userId, amount, currency, method, txId }) => {
  await enrollmentModel.updateOne(
    { course: courseId, student: userId },
    {
      $setOnInsert: {
        course: courseId,
        student: userId,
        status: 'active',
        progress: { completedLessonIds: [], percentage: 0, timeSpent: 0 },
      },
      $set: {
        payment: {
          amount: Number(amount) || 0,
          currency: String(currency || 'USD').toUpperCase(),
          paymentMethod: method,
          transactionId: txId || '',
          paidAt: new Date(),
        },
      },
    },
    { upsert: true }
  );
};

// ---------- STRIPE: checkout ----------
const createStripeCheckout = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });

    const course = await getCourseOr400(courseId, res);
    if (!course) return;

    // not already enrolled
    const existing = await enrollmentModel.findOne({ course: courseId, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled' });

    const amountCents = Math.round((course.pricing.price - (course.pricing.discount || 0) / 100 * course.pricing.price) * 100);
    const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: course.title, metadata: { courseId: String(course._id) } },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        courseId: String(course._id),
        userId: String(req.user._id),
      },
    });

    return res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('createStripeCheckout error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create Stripe checkout', error: err.message });
  }
};

// ---------- STRIPE: webhook (FIXED: use req.body, not req.rawBody) ----------
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    // express.raw({type:'application/json'}) দিলে raw Buffer আসে req.body তে
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.error('Stripe webhook signature verify failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;

      if (session.payment_status === 'paid' && courseId && userId) {
        const amount = session.amount_total ? session.amount_total / 100 : 0;
        await upsertEnrollmentPaid({
          courseId,
          userId,
          amount,
          currency: session.currency?.toUpperCase() || 'USD',
          method: 'stripe',
          txId: session.payment_intent || session.id,
        });
      }
    }
    return res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handling error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// ---------- STRIPE: confirm endpoint (fallback for local/dev) ----------
const confirmStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId is required' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    const courseId = session.metadata?.courseId;
    const metaUserId = session.metadata?.userId;

    // নিরাপত্তার জন্য: লগইনকৃত ইউজারই কিনা পেমেন্টটি করেছে
    if (String(req.user._id) !== String(metaUserId) && req.user.email !== session.customer_details?.email) {
      return res.status(403).json({ success: false, message: 'Not authorized for this session' });
    }

    const amount = session.amount_total ? session.amount_total / 100 : 0;

    await upsertEnrollmentPaid({
      courseId,
      userId: req.user._id,
      amount,
      currency: session.currency?.toUpperCase() || 'USD',
      method: 'stripe',
      txId: session.payment_intent || session.id,
    });

    return res.json({ success: true, message: 'Enrollment recorded' });
  } catch (err) {
    console.error('confirmStripeSession error:', err);
    return res.status(500).json({ success: false, message: 'Failed to confirm session', error: err.message });
  }
};

// ---------- SSLCommerz ----------
const sslInit = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });

    const course = await getCourseOr400(courseId, res);
    if (!course) return;

    // Ensure not already enrolled
    const existing = await enrollmentModel.findOne({ course: courseId, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled' });

    const isLive = (process.env.SSLCZ_MODE || 'sandbox') === 'live';
    const store_id = process.env.SSLCZ_STORE_ID || '';
    const store_passwd = process.env.SSLCZ_STORE_PASS || '';
    if (!store_id || !store_passwd) {
      return res.status(500).json({ success: false, message: 'SSLCommerz store credentials missing' });
    }
    const sslcz = new SSLCommerz(store_id, store_passwd, isLive);

    // Currency and amount
    const currency = (process.env.SSLCZ_CURRENCY || 'BDT').toUpperCase();
    const amountNumber = (course.pricing.price - (course.pricing.discount || 0) / 100 * course.pricing.price);
    const amount = Number.isFinite(amountNumber) ? amountNumber.toFixed(2) : '0.00';
    const tran_id = `course_${course._id}_${req.user._id}_${Date.now()}`;

    const apiBase = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const clientUrl = process.env.CLIENT_URL || (req.headers.origin || 'http://localhost:3000');

    const data = {
      total_amount: amount,
      currency,
      tran_id,
      success_url: `${apiBase}/api/payments/ssl/success`,
      fail_url: `${apiBase}/api/payments/ssl/fail`,
      cancel_url: `${clientUrl}/payment/cancel`,
      ipn_url: `${apiBase}/api/payments/ssl/ipn`,

      product_name: course.title,
      product_category: course.category || 'Course',
      product_profile: 'non-physical-goods',

      // ✅ SSLCommerz mandatory customer fields
      cus_name: req.user.name || 'Customer',
      cus_email: req.user.email,
      cus_add1: 'N/A',
      cus_city: 'N/A',
      cus_country: 'Bangladesh',
      // 🔧 FIX: mandatory
      cus_phone: req.user.phone || '01700000000',
      cus_postcode: '0000',
      cus_state: 'N/A',

      shipping_method: 'NO',
      multi_card_name: '',

      value_a: String(course._id), // courseId
      value_b: String(req.user._id), // userId
    };

    const apiRes = await sslcz.init(data);
    if (apiRes?.GatewayPageURL) {
      return res.json({ success: true, url: apiRes.GatewayPageURL, tran_id });
    }
    return res.status(500).json({ success: false, message: apiRes?.failedreason || 'Failed to init SSLCommerz', data: apiRes });
  } catch (err) {
    console.error('sslInit error:', err);
    return res.status(500).json({ success: false, message: 'Failed to init payment', error: err.message });
  }
};

const sslSuccess = async (req, res) => {
  try {
    const { tran_id, value_a, value_b, amount, currency, val_id } = req.body || {};
    if (!tran_id) return res.status(400).json({ success: false, message: 'Invalid transaction' });

    await upsertEnrollmentPaid({
      courseId: value_a,
      userId: value_b,
      amount,
      currency,
      method: 'sslcommerz',
      txId: val_id || tran_id,
    });

    return res.redirect(`${process.env.CLIENT_URL}/payment/success`);
  } catch (err) {
    console.error('sslSuccess error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
  }
};

const sslFail = async (_req, res) => {
  try { return res.redirect(`${process.env.CLIENT_URL}/payment/cancel`); }
  catch { return res.redirect(`${process.env.CLIENT_URL}/payment/cancel`); }
};

const sslIpn = async (_req, res) => {
  try { return res.json({ success: true }); }
  catch { return res.status(500).json({ success: false }); }
};

module.exports = {
  createStripeCheckout,
  handleStripeWebhook,
  confirmStripeSession,   // ✅ new
  sslInit,
  sslSuccess,
  sslFail,
  sslIpn,
};
