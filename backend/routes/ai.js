const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

/**
 * POST /api/ai/itineraries/generate
 * Generate AI itinerary
 */
router.post('/itineraries/generate', auth, async (req, res) => {
  try {
    const { destination, days, budget, currency, preferences } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        success: false,
        error: 'destination and days are required'
      });
    }

    // Mock AI-generated itinerary plan
    // In production, this would call OpenAI or similar service
    const jsonPlan = {
      destination,
      days,
      dailyItineraries: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        theme: `Day ${i + 1} - Exploration`,
        activities: [
          {
            time: '09:00',
            name: `Activity ${i + 1}A`,
            description: 'Morning activity',
            type: 'activity',
            estimatedCost: Math.round(budget / days / 3)
          },
          {
            time: '14:00',
            name: `Activity ${i + 1}B`,
            description: 'Afternoon activity',
            type: 'activity',
            estimatedCost: Math.round(budget / days / 3)
          },
          {
            time: '19:00',
            name: `Dinner at local restaurant`,
            description: 'Evening dining',
            type: 'restaurant',
            estimatedCost: Math.round(budget / days / 3)
          }
        ]
      })),
      estimatedTotalCost: budget,
      currency: currency || 'HKD'
    };

    // Save to database
    const result = await db.query(
      `INSERT INTO ai_itineraries (user_id, destination, days, budget, currency, preferences, json_plan, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'generated')
       RETURNING id`,
      [req.user.id, destination, days, budget, currency || 'HKD', JSON.stringify(preferences), JSON.stringify(jsonPlan)]
    );

    res.json({
      success: true,
      itineraryId: result.rows[0].id,
      jsonPlan,
      preview: `${days}-day itinerary for ${destination}`
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate itinerary',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/itineraries/:id
 * Get AI itinerary details
 */
router.get('/itineraries/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM ai_itineraries WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }

    res.json({
      success: true,
      itinerary: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch itinerary',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/itineraries/:id/attach-products
 * Attach products to itinerary slots
 */
router.post('/itineraries/:id/attach-products', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { mapping } = req.body;

    if (!mapping || !Array.isArray(mapping)) {
      return res.status(400).json({
        success: false,
        error: 'mapping array is required'
      });
    }

    // Verify itinerary ownership
    const itineraryResult = await db.query(
      'SELECT * FROM ai_itineraries WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (itineraryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }

    const itinerary = itineraryResult.rows[0];

    // Fetch product details for attached products
    const productIds = mapping.map(m => m.productId);
    const productsResult = await db.query(
      `SELECT p.id, p.title, p.type, MIN(i.base_price) as min_price, i.currency
       FROM products p
       LEFT JOIN inventory_slots i ON p.id = i.product_id
       WHERE p.id = ANY($1)
       GROUP BY p.id, p.title, p.type, i.currency`,
      [productIds]
    );

    const products = productsResult.rows;

    // Calculate total
    const total = products.reduce((sum, p) => sum + parseFloat(p.min_price || 0), 0);

    // Prepare attached products data
    const attachedProducts = mapping.map(m => {
      const product = products.find(p => p.id === m.productId);
      return {
        slotId: m.slotId,
        productId: m.productId,
        productTitle: product?.title,
        productType: product?.type,
        price: product?.min_price
      };
    });

    // Update itinerary
    await db.query(
      `UPDATE ai_itineraries 
       SET attached_products = $1, status = 'customized'
       WHERE id = $2`,
      [JSON.stringify(attachedProducts), id]
    );

    res.json({
      success: true,
      itineraryId: id,
      attachedProducts,
      quote: {
        total: total.toFixed(2),
        currency: products[0]?.currency || 'HKD'
      }
    });
  } catch (error) {
    console.error('Error attaching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to attach products',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/itineraries
 * Get all itineraries for current user
 */
router.get('/itineraries', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, destination, days, budget, currency, status, created_at as "createdAt"
       FROM ai_itineraries
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      itineraries: result.rows
    });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch itineraries',
      details: error.message
    });
  }
});

module.exports = router;
