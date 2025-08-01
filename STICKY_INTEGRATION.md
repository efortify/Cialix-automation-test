# Sticky.io Integration Guide

This guide explains how to set up and use the Sticky.io payment processing integration for your eFortify storefront, including how to manage products and content.

## Overview

The integration includes:

- **Server-side API endpoints** for creating orders and processing payments
- **Client-side checkout form** with validation and error handling
- **Content-driven product management** using markdown files
- **Subscription support** for recurring billing with multiple plans
- **Order management** with proper error handling

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Sticky.io Credentials

1. Copy the example configuration file:

   ```bash
   cp sticky-config.example.js sticky-config.cjs
   ```

2. Edit `sticky-config.cjs` with your actual Sticky.io credentials:

   ```javascript
   module.exports = {
     // Sticky.io API Configuration
     apiUrl: 'https://your-instance.sticky.io/api/v1',
     username: 'your_username',
     password: 'your_password',
     campaignId: 'your_campaign_id',

     // Default product for fallback
     defaultProductId: '75', // Cialix 30 Day Supply
     defaultOfferId: 44,
     defaultBillingModel: 2, // One-time purchase
   };
   ```

### 3. Build and Start the Server

```bash
npm run build
npm start
```

## Content Management

### Managing Products in `src/content/product-list.md`

The product catalog is managed through the `src/content/product-list.md` file. This centralized approach makes it easy to update product information without touching code.

#### Product Structure

Each product follows this structure:

```yaml
---
products:
  - id: '75' # Unique product ID (matches Sticky.io)
    name: 'Cialix 30 Day Supply'
    description: 'Maximum sexual benefits with 100% natural ingredients'
    totalPrice: 89.99
    price: 89.99
    image: 'https://assets.sticky.io/images/...'
    badge: 'BEST SELLER'
    badgeColor: 'bg-green-500'
    category: 'cialix' # Product category for filtering
    features: # Product features list
      - '100% Natural Ingredients'
      - 'Maximum Sexual Benefits'
      - 'Enhanced Stamina'
      - 'Improved Performance'
    details: 'Detailed product description...'
    plans: # Subscription and billing plans
      - billing_model_id: 2
        discount_percentage: 0
        frequency: 'One-Time'
        description: 'One-time purchase'
        price: 89.99
        offer_id: 44
      - billing_model_id: 5
        discount_percentage: 15
        frequency: '15 days'
        description: 'Subscribe and save 15% every 15 days'
        price: 76.49
        offer_id: 44
      # ... more plans
---
```

#### Adding New Products

1. **Create the product entry** in `product-list.md`:

   ```yaml
   - id: 'NEW_ID'
     name: 'New Product Name'
     description: 'Product description'
     totalPrice: 99.99
     price: 99.99
     image: 'https://assets.sticky.io/images/...'
     badge: 'NEW'
     badgeColor: 'bg-blue-500'
     category: 'new_category'
     features:
       - 'Feature 1'
       - 'Feature 2'
     details: 'Detailed description...'
     plans:
       - billing_model_id: 2
         discount_percentage: 0
         frequency: 'One-Time'
         description: 'One-time purchase'
         price: 99.99
         offer_id: YOUR_OFFER_ID
   ```

2. **Update Sticky.io** with the new product and offer IDs
3. **Add product images** to your Sticky.io assets
4. **Test the product** on your storefront

#### Updating Existing Products

1. **Modify product details** in `product-list.md`:

   - Update prices, descriptions, features
   - Change images, badges, or categories
   - Modify subscription plans

2. **Update Sticky.io** if product IDs or offer IDs change
3. **Rebuild the site** to reflect changes:
   ```bash
   npm run build
   ```

#### Product Categories

The system supports these categories:

- `cialix` - Cialix products (sexual enhancement)
- `testorx` - TestoRX products (testosterone support)
- `climaxin` - Climaxin products (climax control)
- `combo` - Combo packs (multiple products)

#### Subscription Plans

Each product can have multiple billing plans:

- **One-time purchase** (`billing_model_id: 2`)
- **15-day subscription** (`billing_model_id: 5`)
- **30-day subscription** (`billing_model_id: 3`)
- **60-day subscription** (`billing_model_id: 4`)
- **90-day subscription** (`billing_model_id: 6`)

### Managing Other Content Files

#### Product Detail Content

Product-specific content is managed in separate markdown files:

- `src/content/cialix-content.md` - Cialix product details
- `src/content/testorx-content.md` - TestoRX product details
- `src/content/climaxin-content.md` - Climaxin product details

These files contain:

- Benefits sections
- Ingredients information
- How it works explanations
- Call-to-action content

#### General Content

Other content files in `src/content/`:

- `hero.md` - Hero section content
- `benefits.md` - General benefits content
- `about.md` - About section content
- `faq.md` - Frequently asked questions
- `featured-products.md` - Featured products content

## API Endpoints

### POST /api/create-order

Creates a new order in Sticky.io using the correct API format.

**Request Body:**

```javascript
{
  "customer": {
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US",
    "cardNumber": "1444444444444440",
    "cardExpMonth": "12",
    "cardExpYear": "25",
    "cardCvv": "123"
  },
  "cart": [
    {
      "id": "75",
      "name": "Cialix 30 Day Supply",
      "price": 89.99,
      "quantity": 1,
      "image": "https://assets.sticky.io/images/...",
      "selectedPlan": {
        "billing_model_id": 3,
        "discount_percentage": 15,
        "frequency": "30 days",
        "description": "Subscribe and save 15% every 30 days",
        "price": 76.49,
        "offer_id": 44
      }
    }
  ]
}
```

**Response:**

```javascript
{
  "success": true,
  "order_id": "12345",
  "transaction_id": "67890",
  "message": "Order created successfully",
  "response": {
    // Full Sticky.io response
  }
}
```

## Features

### 1. Subscription Support

The integration supports multiple subscription plans:

- **One-time purchases**: Uses `billing_model_id: 2`
- **15-day subscriptions**: Uses `billing_model_id: 5`
- **30-day subscriptions**: Uses `billing_model_id: 3`
- **60-day subscriptions**: Uses `billing_model_id: 4`
- **90-day subscriptions**: Uses `billing_model_id: 6`

### 2. Content-Driven Product Management

- **Centralized product data** in `product-list.md`
- **Easy updates** without code changes
- **Consistent structure** across all products
- **Category-based filtering** and organization

### 3. Form Validation

The checkout form includes comprehensive validation:

- **Required fields**: Email, name, address, payment info
- **Email format**: Validates email address format
- **Card validation**: Basic Luhn algorithm for card numbers
- **Real-time feedback**: Visual indicators for validation errors

### 4. Error Handling

Robust error handling for:

- **API failures**: Network errors, authentication issues
- **Validation errors**: Invalid form data
- **Payment failures**: Declined cards, insufficient funds
- **User feedback**: Clear error messages and loading states

## Security Considerations

### 1. Environment Variables

Store sensitive credentials in environment variables:

```bash
export STICKY_USERNAME="your_username"
export STICKY_PASSWORD="your_password"
export STICKY_CAMPAIGN_ID="your_campaign_id"
```

### 2. HTTPS

Always use HTTPS in production to secure payment data transmission.

### 3. Input Validation

All user inputs are validated server-side before processing.

### 4. Error Logging

Sensitive information is not logged in error messages.

## Testing

### 1. Test Mode

Sticky.io provides test credentials for development:

```javascript
// Use test credentials for development
username: 'test_username',
password: 'test_password',
campaignId: 'test_campaign_id'
```

### 2. Test Cards

Use Sticky.io's test card numbers for payment testing:

- **Test Card**: 1444444444444440

### 3. Test Scenarios

Test the following scenarios:

- ✅ Valid card, successful payment
- ❌ Invalid card, declined payment
- ✅ Subscription creation with different plans
- ❌ Insufficient funds
- ✅ Mixed cart (subscription + one-time)
- ❌ Network errors

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Verify username/password in `sticky-config.cjs`
   - Check API URL is correct
   - Ensure credentials have proper permissions

2. **Product Not Found**

   - Verify product ID exists in `product-list.md`
   - Check product ID matches Sticky.io
   - Ensure product is active in your campaign

3. **Offer Mapping Errors**

   - Verify offer IDs exist in Sticky.io
   - Check offer IDs in product plans
   - Ensure offers are active in your campaign

4. **Payment Declines**

   - Use test card numbers for development
   - Check card expiration dates
   - Verify CVV codes

5. **Content Not Updating**

   - Rebuild the site after content changes
   - Check markdown syntax in content files
   - Verify file paths and structure

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
export DEBUG=true
```

## Content Management Best Practices

### 1. Product Updates

- **Always backup** `product-list.md` before major changes
- **Test changes** on a development environment first
- **Update Sticky.io** before changing product/offer IDs
- **Rebuild the site** after content changes

### 2. Image Management

- **Use Sticky.io assets** for product images
- **Optimize images** for web performance
- **Maintain consistent** image dimensions
- **Update image URLs** when assets change

### 3. Pricing Updates

- **Update all plan prices** when changing base prices
- **Calculate discounts** correctly for subscription plans
- **Verify pricing** matches Sticky.io configuration
- **Test checkout flow** after price changes

### 4. Content Organization

- **Use consistent formatting** across all content files
- **Group related products** by category
- **Maintain clear descriptions** and features
- **Keep content up-to-date** with product changes

## Support

For issues with:

- **Sticky.io API**: Contact Sticky.io support
- **Integration code**: Check this documentation
- **Content management**: Verify markdown syntax and file structure
- **Configuration**: Verify your credentials and settings

## Next Steps

1. **Customize the checkout form** to match your brand
2. **Add additional payment methods** (PayPal, Apple Pay, etc.)
3. **Implement order tracking** and customer notifications
4. **Add analytics** to track conversion rates
5. **Set up webhooks** for real-time order updates
6. **Create product variants** with different sizes/formulas
7. **Add customer reviews** and testimonials
8. **Implement inventory management** if needed
