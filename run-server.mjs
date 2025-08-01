import express from 'express';
import { handler as ssrHandler } from './dist/server/entry.mjs';
import stickyConfig from './sticky-config.cjs';

const app = express();
// Change this based on your astro.config.mjs, `base` option.
// They should match. The default value is "/".
console.log('hello');
const base = '/';

// Add security headers to prevent indexing
app.use((req, res, next) => {
  // Block all bots and crawlers
  res.setHeader(
    'X-Robots-Tag',
    'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // Block specific user agents
  const userAgent = req.headers['user-agent'] || '';
  const blockedBots = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'discordbot',
    'slackbot',
    'applebot',
    'petalbot',
    'ahrefsbot',
    'semrushbot',
    'mj12bot',
    'dotbot',
    'screaming frog',
    'rogerbot',
    'exabot',
    'ia_archiver',
    'archive.org',
  ];

  const isBlockedBot = blockedBots.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  if (isBlockedBot) {
    return res.status(403).json({
      error: 'Access denied for bots and crawlers',
      message: 'This website is not available for automated access',
    });
  }

  next();
});

app.use(express.json());
app.use(base, express.static('dist/client/'));
app.use(ssrHandler);

// Load Sticky.io configuration
let STICKY_CONFIG;
try {
  STICKY_CONFIG = stickyConfig;
  console.log('Sticky.io configuration loaded successfully');
  console.log('API URL:', STICKY_CONFIG.apiUrl);
  console.log('Campaign ID:', STICKY_CONFIG.campaignId);
} catch (error) {
  console.warn('sticky-config.js not found, using default configuration');
  STICKY_CONFIG = {
    apiUrl: 'https://globalhealthsandbox.sticky.io/api/v1',
    username: 'your_username',
    password: 'your_password',
    campaignId: '6',
    productId: '121',
    productMapping: {},
    offerMapping: {},
    billingModels: {
      oneTime: 1,
      subscription: 2,
    },
  };
}

// Helper function to make authenticated requests to Sticky.io
async function makeStickyRequest(endpoint, data) {
  const auth = Buffer.from(
    `${STICKY_CONFIG.username}:${STICKY_CONFIG.password}`
  ).toString('base64');

  const payload = JSON.stringify(data);
  console.log(
    `Making Sticky.io API request to ${endpoint} with payload:`,
    payload
  );

  try {
    const response = await fetch(`${STICKY_CONFIG.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(
        `Sticky.io API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    if (result?.decline_reason?.length > 0) {
      throw new Error(
        `Sticky.io API declined the request: ${result.decline_reason}`
      );
    }
    console.log('Sticky.io API response:', result);

    return result;
  } catch (error) {
    console.error('Sticky.io API request failed:', error);
    throw error;
  }
}

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { customer, cart, subscription } = req.body;

    // Validate required fields
    if (!customer || !cart || cart.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get client IP address
    const ipAddress =
      req.ip ||
      req.connection.remoteAddress ||
      req.headers['x-forwarded-for'] ||
      '127.0.0.1';

    // Prepare order data for Sticky.io using the correct format
    const orderData = {
      campaignId: STICKY_CONFIG.campaignId,
      email: customer.email,
      phone: customer.phone || '+1(555)123-4567',
      ipAddress: ipAddress,
      firstName: customer.firstName,
      lastName: customer.lastName,
      currency: 'USD',
      shippingAddress1: customer.address1,
      shippingAddress2: customer.address2 || '',
      shippingCity: customer.city,
      shippingState: customer.state,
      shippingZip: customer.zip,
      shippingCountry: customer.country || 'US',
      billingAddress1: customer.address1,
      billingAddress2: customer.address2 || '',
      billingCity: customer.city,
      billingState: customer.state,
      billingZip: customer.zip,
      billingCountry: customer.country || 'US',
      creditCardType: customer.cardBrand || 'visa',
      creditCardNumber: customer.cardNumber,
      expirationDate: customer.cardExpMonth + customer.cardExpYear,
      CVV: customer.cardCvv,
      shippingId: '2', // Standard shipping
      tranType: 'Sale',
      offers: cart.map((item) => {
        console.log('item', JSON.stringify(item, null, 2));
        // Map your product ID to Sticky.io product ID
        const stickyProductId = item.id;
        const billingModelId = item.selectedPlan.billing_model_id;
        const offerId = item.selectedPlan.offer_id;

        return {
          offer_id: offerId,
          product_id: parseInt(stickyProductId),
          billing_model_id: billingModelId,
          quantity: item.quantity,
        };
      }),
      AFFID: req.body.affiliateId || '',
      C1: req.body.subaffiliate1 || '',
      C2: req.body.subaffiliate2 || '',
      C3: req.body.subaffiliate3 || '',
      click_id: req.body.clickId || '',
    };

    // Create order in Sticky.io
    const stickyResponse = await makeStickyRequest('/new_order', orderData);

    // Return success response
    res.json({
      success: true,
      order_id: stickyResponse.order_id || stickyResponse.id,
      transaction_id: stickyResponse.transaction_id,
      message: 'Order created successfully',
      response: stickyResponse,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      details: error.message,
    });
  }
});

app.listen(process.env.PORT || 8088);
