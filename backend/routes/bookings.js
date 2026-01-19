const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

/**
 * POST /api/bookings/quote
 * Create a quote (does not reduce inventory)
 */
router.post('/quote', async (req, res) => {
  try {
    const { productId, date, pax, extras, currency } = req.body;

    if (!productId || !date || !pax) {
      return res.status(400).json({
        success: false,
        error: 'productId, date, and pax are required'
      });
    }

    // Check inventory availability
    const inventoryQuery = `
      SELECT remaining, base_price, currency
      FROM inventory_slots
      WHERE product_id = $1 AND date = $2 AND remaining > 0
      LIMIT 1
    `;

    const inventoryResult = await db.query(inventoryQuery, [productId, date]);

    if (inventoryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No availability for the selected date'
      });
    }

    const inventory = inventoryResult.rows[0];

    // Calculate total based on pax
    let total = 0;
    const breakdown = [];

    pax.forEach(p => {
      const price = inventory.base_price * (p.type === 'child' ? 0.7 : 1.0);
      const subtotal = price * p.qty;
      total += subtotal;
      breakdown.push({
        type: p.type,
        qty: p.qty,
        price: price,
        subtotal: subtotal
      });
    });

    // Add extras if provided
    if (extras && Array.isArray(extras)) {
      extras.forEach(e => {
        total += e.price * e.qty;
        breakdown.push({
          name: e.name,
          qty: e.qty,
          price: e.price,
          subtotal: e.price * e.qty
        });
      });
    }

    const quoteCurrency = currency || inventory.currency || 'HKD';
    const validUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create quote
    const quoteResult = await db.query(
      `INSERT INTO quotes (product_id, date, pax, extras, total, breakdown, currency, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [productId, date, JSON.stringify(pax), JSON.stringify(extras), total, JSON.stringify(breakdown), quoteCurrency, validUntil]
    );

    res.json({
      success: true,
      quoteId: quoteResult.rows[0].id,
      total: parseFloat(total).toFixed(2),
      currency: quoteCurrency,
      breakdown,
      validUntil: validUntil.toISOString()
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quote',
      details: error.message
    });
  }
});

/**
 * POST /api/bookings
 * Create a booking (reduces inventory atomically)
 */
router.post('/', auth, async (req, res) => {
  try {
    const { quoteId, productId, date, pax, userInfo, paymentMode, metadata } = req.body;

    let finalProductId, finalDate, finalPax, finalTotal, finalCurrency;

    await db.query('BEGIN');

    if (quoteId) {
      // Use quote
      const quoteResult = await db.query(
        'SELECT * FROM quotes WHERE id = $1 AND valid_until > NOW()',
        [quoteId]
      );

      if (quoteResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Quote not found or expired'
        });
      }

      const quote = quoteResult.rows[0];
      finalProductId = quote.product_id;
      finalDate = quote.date;
      finalPax = quote.pax;
      finalTotal = quote.total;
      finalCurrency = quote.currency;
    } else {
      // Direct booking without quote
      if (!productId || !date || !pax) {
        await db.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Either quoteId or (productId, date, pax) must be provided'
        });
      }

      finalProductId = productId;
      finalDate = date;
      finalPax = pax;

      // Calculate total
      const inventoryResult = await db.query(
        'SELECT base_price, currency FROM inventory_slots WHERE product_id = $1 AND date = $2',
        [productId, date]
      );

      if (inventoryResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'No availability for the selected date'
        });
      }

      const inventory = inventoryResult.rows[0];
      finalTotal = pax.reduce((sum, p) => {
        return sum + (inventory.base_price * (p.type === 'child' ? 0.7 : 1.0) * p.qty);
      }, 0);
      finalCurrency = inventory.currency;
    }

    // Get total quantity
    const totalQty = (typeof finalPax === 'string' ? JSON.parse(finalPax) : finalPax)
      .reduce((sum, p) => sum + p.qty, 0);

    // Lock inventory (SELECT FOR UPDATE) and reduce remaining
    const lockResult = await db.query(
      `SELECT id, remaining FROM inventory_slots 
       WHERE product_id = $1 AND date = $2 
       FOR UPDATE`,
      [finalProductId, finalDate]
    );

    if (lockResult.rows.length === 0 || lockResult.rows[0].remaining < totalQty) {
      await db.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Insufficient inventory'
      });
    }

    // Reduce inventory
    await db.query(
      'UPDATE inventory_slots SET remaining = remaining - $1 WHERE product_id = $2 AND date = $3',
      [totalQty, finalProductId, finalDate]
    );

    // Get product details
    const productResult = await db.query(
      'SELECT supplier_id, policies FROM products WHERE id = $1',
      [finalProductId]
    );

    const product = productResult.rows[0];

    // Create booking
    const status = paymentMode === 'pay_now' ? 'AWAITING_PAYMENT' : 'PENDING';
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const bookingResult = await db.query(
      `INSERT INTO bookings (
        user_id, supplier_id, product_id, quote_id, date, 
        pax, total_price, currency, status, policy_snapshot, 
        user_info, metadata, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, status, expires_at`,
      [
        req.user.id, 
        product.supplier_id, 
        finalProductId, 
        quoteId, 
        finalDate,
        JSON.stringify(finalPax), 
        finalTotal, 
        finalCurrency, 
        status,
        product.policies,
        JSON.stringify(userInfo),
        JSON.stringify(metadata),
        expiresAt
      ]
    );

    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      bookingId: bookingResult.rows[0].id,
      status: bookingResult.rows[0].status,
      total: parseFloat(finalTotal).toFixed(2),
      currency: finalCurrency,
      expiresAt: bookingResult.rows[0].expires_at
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      details: error.message
    });
  }
});

/**
 * POST /api/bookings/:id/confirm
 * Confirm a booking (after payment)
 */
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentRef } = req.body;

    const result = await db.query(
      `UPDATE bookings 
       SET status = 'CONFIRMED', 
           confirmed_at = NOW(), 
           payment_ref = $2
       WHERE id = $1 AND user_id = $3 AND status IN ('PENDING', 'AWAITING_PAYMENT')
       RETURNING id, status`,
      [id, paymentRef, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or cannot be confirmed'
      });
    }

    res.json({
      success: true,
      bookingId: result.rows[0].id,
      status: result.rows[0].status,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm booking',
      details: error.message
    });
  }
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking
 */
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await db.query('BEGIN');

    // Get booking details
    const bookingResult = await db.query(
      `SELECT b.*, p.policies 
       FROM bookings b
       JOIN products p ON b.product_id = p.id
       WHERE b.id = $1 AND b.user_id = $2`,
      [id, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.status === 'CANCELLED') {
      await db.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Booking already cancelled'
      });
    }

    // Calculate refund amount based on policy
    const refundAmount = parseFloat(booking.total_price); // Simplified; should check cancellation policy

    // Restore inventory
    const totalQty = (typeof booking.pax === 'string' ? JSON.parse(booking.pax) : booking.pax)
      .reduce((sum, p) => sum + p.qty, 0);

    await db.query(
      'UPDATE inventory_slots SET remaining = remaining + $1 WHERE product_id = $2 AND date = $3',
      [totalQty, booking.product_id, booking.date]
    );

    // Update booking status
    await db.query(
      `UPDATE bookings 
       SET status = 'CANCELLED', cancelled_at = NOW(), metadata = metadata || $2
       WHERE id = $1`,
      [id, JSON.stringify({ cancelReason: reason })]
    );

    await db.query('COMMIT');

    res.json({
      success: true,
      bookingId: id,
      status: 'CANCELLED',
      refundAmount: refundAmount.toFixed(2),
      currency: booking.currency
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking',
      details: error.message
    });
  }
});

/**
 * GET /api/bookings/user/me
 * Get all bookings for current user
 */
router.get('/user/me', auth, async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id,
        b.date,
        b.status,
        b.total_price as "totalPrice",
        b.currency,
        b.created_at as "createdAt",
        p.title as "productTitle",
        p.type as "productType",
        d.name as destination,
        s.company_name as "supplierName"
      FROM bookings b
      INNER JOIN products p ON b.product_id = p.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      INNER JOIN suppliers s ON b.supplier_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await db.query(query, [req.user.id]);

    res.json({
      success: true,
      bookings: result.rows
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      details: error.message
    });
  }
});

/**
 * GET /api/bookings/:id
 * Get specific booking details
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        b.*,
        p.title as "productTitle",
        p.type as "productType",
        d.name as destination,
        s.company_name as "supplierName"
      FROM bookings b
      INNER JOIN products p ON b.product_id = p.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      INNER JOIN suppliers s ON b.supplier_id = s.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const result = await db.query(query, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      details: error.message
    });
  }
});

module.exports = router;
