const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

/**
 * POST /api/suppliers/products
 * Create a new product (supplier only)
 */
router.post('/products', auth, async (req, res) => {
  try {
    // Check if user is a supplier
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: 'Only suppliers can create products'
      });
    }

    // Get supplier_id for this user
    const supplierQuery = await db.query(
      'SELECT id FROM suppliers WHERE user_id = $1',
      [req.user.id]
    );

    if (supplierQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Supplier profile not found'
      });
    }

    const supplierId = supplierQuery.rows[0].id;

    const {
      type,
      title,
      shortDesc,
      destinationId,
      durationDays,
      durationHours,
      tags,
      policies,
      content
    } = req.body;

    // Validate required fields
    if (!type || !title || !shortDesc) {
      return res.status(400).json({
        success: false,
        error: 'type, title, and shortDesc are required'
      });
    }

    // Start transaction
    await db.query('BEGIN');

    // Insert product
    const productResult = await db.query(
      `INSERT INTO products (
        supplier_id, type, title, short_desc, destination_id,
        duration_days, duration_hours, tags, policies, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft')
      RETURNING id, status`,
      [supplierId, type, title, shortDesc, destinationId, durationDays, durationHours, tags, JSON.stringify(policies)]
    );

    const productId = productResult.rows[0].id;

    // Insert product content if provided
    if (content) {
      const locale = content.locale || 'en';
      await db.query(
        `INSERT INTO product_contents (product_id, locale, long_desc, itinerary, images)
         VALUES ($1, $2, $3, $4, $5)`,
        [productId, locale, content.longDesc, JSON.stringify(content.itinerary), JSON.stringify(content.images)]
      );
    }

    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      id: productId,
      status: 'draft',
      message: 'Product created successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      details: error.message
    });
  }
});

/**
 * GET /api/suppliers/products
 * Get all products for the current supplier
 */
router.get('/products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: 'Only suppliers can access this endpoint'
      });
    }

    const supplierQuery = await db.query(
      'SELECT id FROM suppliers WHERE user_id = $1',
      [req.user.id]
    );

    if (supplierQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Supplier profile not found'
      });
    }

    const supplierId = supplierQuery.rows[0].id;

    const productsQuery = `
      SELECT 
        p.id,
        p.title,
        p.type,
        p.status,
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        d.name as destination,
        COUNT(DISTINCT b.id) as "bookingsCount",
        COUNT(DISTINCT i.id) as "inventorySlotsCount"
      FROM products p
      LEFT JOIN destinations d ON p.destination_id = d.id
      LEFT JOIN bookings b ON p.id = b.product_id
      LEFT JOIN inventory_slots i ON p.id = i.product_id AND i.remaining > 0
      WHERE p.supplier_id = $1
      GROUP BY p.id, p.title, p.type, p.status, p.created_at, p.updated_at, d.name
      ORDER BY p.created_at DESC
    `;

    const result = await db.query(productsQuery, [supplierId]);

    res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});

/**
 * PUT /api/suppliers/products/:id
 * Update a product (supplier only)
 */
router.put('/products/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: 'Only suppliers can update products'
      });
    }

    const { id } = req.params;

    // Verify ownership
    const supplierQuery = await db.query(
      'SELECT id FROM suppliers WHERE user_id = $1',
      [req.user.id]
    );

    if (supplierQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Supplier profile not found'
      });
    }

    const supplierId = supplierQuery.rows[0].id;

    // Check if product belongs to this supplier
    const productCheck = await db.query(
      'SELECT id FROM products WHERE id = $1 AND supplier_id = $2',
      [id, supplierId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or access denied'
      });
    }

    const {
      title,
      shortDesc,
      destinationId,
      durationDays,
      durationHours,
      tags,
      policies,
      status,
      content
    } = req.body;

    await db.query('BEGIN');

    // Update product
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    if (shortDesc !== undefined) {
      updateFields.push(`short_desc = $${paramCount++}`);
      updateValues.push(shortDesc);
    }
    if (destinationId !== undefined) {
      updateFields.push(`destination_id = $${paramCount++}`);
      updateValues.push(destinationId);
    }
    if (durationDays !== undefined) {
      updateFields.push(`duration_days = $${paramCount++}`);
      updateValues.push(durationDays);
    }
    if (durationHours !== undefined) {
      updateFields.push(`duration_hours = $${paramCount++}`);
      updateValues.push(durationHours);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramCount++}`);
      updateValues.push(tags);
    }
    if (policies !== undefined) {
      updateFields.push(`policies = $${paramCount++}`);
      updateValues.push(JSON.stringify(policies));
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await db.query(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        updateValues
      );
    }

    // Update content if provided
    if (content) {
      const locale = content.locale || 'en';
      await db.query(
        `INSERT INTO product_contents (product_id, locale, long_desc, itinerary, images)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (product_id, locale) 
         DO UPDATE SET long_desc = $3, itinerary = $4, images = $5`,
        [id, locale, content.longDesc, JSON.stringify(content.itinerary), JSON.stringify(content.images)]
      );
    }

    await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      details: error.message
    });
  }
});

/**
 * GET /api/suppliers/inventory/:productId/calendar
 * Get inventory calendar for a product
 */
router.get('/inventory/:productId/calendar', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: 'Only suppliers can access inventory'
      });
    }

    const { productId } = req.params;
    const { from, to } = req.query;

    // Verify ownership
    const supplierQuery = await db.query(
      'SELECT id FROM suppliers WHERE user_id = $1',
      [req.user.id]
    );

    if (supplierQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Supplier profile not found'
      });
    }

    const supplierId = supplierQuery.rows[0].id;

    const productCheck = await db.query(
      'SELECT id FROM products WHERE id = $1 AND supplier_id = $2',
      [productId, supplierId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or access denied'
      });
    }

    let query = `
      SELECT 
        id,
        date,
        start_time as "startTime",
        capacity,
        remaining,
        base_price as "basePrice",
        currency,
        metadata
      FROM inventory_slots
      WHERE product_id = $1
    `;

    const params = [productId];

    if (from && to) {
      query += ' AND date >= $2 AND date <= $3';
      params.push(from, to);
    }

    query += ' ORDER BY date, start_time';

    const result = await db.query(query, params);

    res.json({
      success: true,
      productId,
      slots: result.rows
    });
  } catch (error) {
    console.error('Error fetching inventory calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory calendar',
      details: error.message
    });
  }
});

/**
 * PUT /api/suppliers/inventory/:productId
 * Update inventory slots for a product
 */
router.put('/inventory/:productId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: 'Only suppliers can update inventory'
      });
    }

    const { productId } = req.params;
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        error: 'updates array is required'
      });
    }

    // Verify ownership
    const supplierQuery = await db.query(
      'SELECT id FROM suppliers WHERE user_id = $1',
      [req.user.id]
    );

    if (supplierQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Supplier profile not found'
      });
    }

    const supplierId = supplierQuery.rows[0].id;

    const productCheck = await db.query(
      'SELECT id FROM products WHERE id = $1 AND supplier_id = $2',
      [productId, supplierId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or access denied'
      });
    }

    await db.query('BEGIN');

    for (const update of updates) {
      const { date, startTime, capacity, basePrice, currency } = update;

      if (!date || capacity === undefined || basePrice === undefined) {
        await db.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Each update must include date, capacity, and basePrice'
        });
      }

      // Upsert inventory slot
      await db.query(
        `INSERT INTO inventory_slots (product_id, date, start_time, capacity, remaining, base_price, currency)
         VALUES ($1, $2, $3, $4, $4, $5, $6)
         ON CONFLICT (product_id, date, start_time)
         DO UPDATE SET capacity = $4, base_price = $5, currency = $6,
                      remaining = inventory_slots.remaining + ($4 - inventory_slots.capacity)`,
        [productId, date, startTime || '00:00:00', capacity, basePrice, currency || 'HKD']
      );
    }

    await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory',
      details: error.message
    });
  }
});

module.exports = router;
