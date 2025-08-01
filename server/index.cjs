const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4321;

// Middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'dist/client')));

// Load Sticky.io configuration
let STICKY_CONFIG;
try {
  STICKY_CONFIG = require(path.join(process.cwd(), 'sticky-config.cjs'));
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
    shippingOptions: {
      standard: {
        id: '3',
        name: 'Standard Shipping',
        price: 0,
        days: '3-5 business days',
      },
    },
  };
}

// Helper function to make authenticated requests to Sticky.io
async function makeStickyRequest(endpoint, data) {
  const auth = Buffer.from(
    `${STICKY_CONFIG.username}:${STICKY_CONFIG.password}`
  ).toString('base64');

  try {
    const response = await fetch(`${STICKY_CONFIG.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Sticky.io API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
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
      creditCardType: 'Visa', // You may want to detect this automatically
      creditCardNumber: customer.cardNumber,
      expirationDate: customer.cardExpMonth + customer.cardExpYear,
      CVV: customer.cardCvv,
      shippingId: '3', // Standard shipping
      tranType: 'Sale',
      offers: cart.map((item) => {
        // Map your product ID to Sticky.io product ID
        const stickyProductId =
          STICKY_CONFIG.productMapping[item.id] || STICKY_CONFIG.productId;
        const billingModelId = item.isSubscription
          ? STICKY_CONFIG.billingModels.subscription
          : STICKY_CONFIG.billingModels.oneTime;
        const offerId = STICKY_CONFIG.offerMapping[item.id] || 24; // Default offer ID

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

// Get product information endpoint
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // You can fetch product details from Sticky.io if needed
    // For now, we'll return a basic structure
    const productData = {
      product_id: productId,
      name: 'Cialix Product',
      price: 49.99,
      available: true,
    };

    res.json(productData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Validate card endpoint
app.post('/api/validate-card', async (req, res) => {
  try {
    const { cardNumber, cardExpMonth, cardExpYear, cardCvv } = req.body;

    // Basic card validation
    const isValid =
      cardNumber &&
      cardNumber.length >= 13 &&
      cardNumber.length <= 19 &&
      cardExpMonth &&
      cardExpMonth >= 1 &&
      cardExpMonth <= 12 &&
      cardExpYear &&
      cardExpYear >= new Date().getFullYear() &&
      cardCvv &&
      cardCvv.length >= 3 &&
      cardCvv.length <= 4;

    res.json({
      valid: isValid,
      message: isValid ? 'Card is valid' : 'Invalid card information',
    });
  } catch (error) {
    console.error('Error validating card:', error);
    res.status(500).json({ error: 'Failed to validate card' });
  }
});

(async () => {
  const { createExports } = await import('@astrojs/node/server.js');
  const { manifest } = await import('../dist/server/manifest_C0AGpK65.mjs');
  const { handler } = createExports(manifest, { mode: 'standalone' });

  // Handle all other routes with Astro
  app.use(handler);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Sticky.io integration enabled`);
    console.log(`Campaign ID: ${STICKY_CONFIG.campaignId}`);
  });
})();
