const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

/**
 * GET /api/products
 * Search and filter products
 * Query params: q, destination, type, tags, dateFrom, dateTo, minPrice, maxPrice, page, size
 */
router.get('/', async (req, res) => {
  try {
    const {
      q,
      destination,
      type,
      tags,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice,
      page = 1,
      size = 30
    } = req.query;

    const offset = (page - 1) * size;
    let queryParams = [];
    let whereClauses = ["p.status = 'published'"];

    // Build WHERE clause
    if (q) {
      whereClauses.push("(p.title ILIKE $" + (queryParams.length + 1) + " OR p.short_desc ILIKE $" + (queryParams.length + 1) + ")");
      queryParams.push(`%${q}%`);
    }

    if (destination) {
      whereClauses.push("p.destination_id = $" + (queryParams.length + 1));
      queryParams.push(destination);
    }

    if (type) {
      whereClauses.push("p.type = $" + (queryParams.length + 1));
      queryParams.push(type);
    }

    if (tags) {
      whereClauses.push("p.tags && $" + (queryParams.length + 1));
      queryParams.push(tags.split(','));
    }

    // Date and price filtering through inventory_slots
    if (dateFrom || dateTo || minPrice || maxPrice) {
      let inventoryJoin = `INNER JOIN inventory_slots i ON p.id = i.product_id WHERE i.remaining > 0`;
      if (dateFrom) {
        whereClauses.push("i.date >= $" + (queryParams.length + 1));
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        whereClauses.push("i.date <= $" + (queryParams.length + 1));
        queryParams.push(dateTo);
      }
      if (minPrice) {
        whereClauses.push("i.base_price >= $" + (queryParams.length + 1));
        queryParams.push(minPrice);
      }
      if (maxPrice) {
        whereClauses.push("i.base_price <= $" + (queryParams.length + 1));
        queryParams.push(maxPrice);
      }
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Count total
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      ${whereClause}
    `;
    
    queryParams.push(parseInt(size));
    queryParams.push(offset);

    // Get products with pagination
    const productsQuery = `
      SELECT DISTINCT 
        p.id, 
        p.title, 
        p.short_desc as "shortDesc",
        p.type,
        p.duration_days as "durationDays",
        p.duration_hours as "durationHours",
        d.name as destination,
        d.city as "destinationCity",
        MIN(i.base_price) as "minPrice",
        i.currency,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(DISTINCT r.id) as "reviewsCount",
        pc.images
      FROM products p
      LEFT JOIN destinations d ON p.destination_id = d.id
      LEFT JOIN inventory_slots i ON p.id = i.product_id AND i.remaining > 0
      LEFT JOIN reviews r ON p.id = r.product_id
      LEFT JOIN product_contents pc ON p.id = pc.product_id AND pc.locale = 'en'
      ${whereClause}
      GROUP BY p.id, p.title, p.short_desc, p.type, p.duration_days, p.duration_hours, d.name, d.city, i.currency, pc.images
      ORDER BY p.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;

    const countResult = await db.query(countQuery, queryParams.slice(0, -2));
    const productsResult = await db.query(productsQuery, queryParams);

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      size: parseInt(size),
      items: productsResult.rows.map(product => ({
        ...product,
        thumbnailUrl: product.images && product.images[0] ? product.images[0] : null
      }))
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});

/**
 * GET /api/products/:id
 * Get product details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locale = req.query.locale || 'en';

    const productQuery = `
      SELECT 
        p.*,
        s.company_name as "supplierName",
        s.id as "supplierId",
        d.name as destination,
        d.city as "destinationCity",
        d.country as "destinationCountry",
        pc.long_desc as "longDesc",
        pc.itinerary,
        pc.images,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(DISTINCT r.id) as "reviewsCount"
      FROM products p
      INNER JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      LEFT JOIN product_contents pc ON p.id = pc.product_id AND pc.locale = $2
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1 AND p.status = 'published'
      GROUP BY p.id, s.company_name, s.id, d.name, d.city, d.country, pc.long_desc, pc.itinerary, pc.images
    `;

    const result = await db.query(productQuery, [id, locale]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = result.rows[0];

    res.json({
      success: true,
      product: {
        id: product.id,
        title: product.title,
        shortDesc: product.short_desc,
        longDesc: product.longDesc,
        type: product.type,
        durationDays: product.duration_days,
        durationHours: product.duration_hours,
        destination: product.destination,
        destinationCity: product.destinationCity,
        destinationCountry: product.destinationCountry,
        images: product.images || [],
        itinerary: product.itinerary,
        policies: product.policies,
        tags: product.tags,
        rating: parseFloat(product.rating).toFixed(1),
        reviewsCount: parseInt(product.reviewsCount),
        supplier: {
          id: product.supplierId,
          name: product.supplierName
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      details: error.message
    });
  }
});

/**
 * GET /api/products/:id/availability
 * Get product availability calendar
 */
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'from and to date parameters are required'
      });
    }

    const query = `
      SELECT 
        date,
        start_time as "startTime",
        capacity,
        remaining,
        base_price as "basePrice",
        currency
      FROM inventory_slots
      WHERE product_id = $1 
        AND date >= $2 
        AND date <= $3
        AND remaining > 0
      ORDER BY date, start_time
    `;

    const result = await db.query(query, [id, from, to]);

    res.json({
      success: true,
      productId: id,
      availability: result.rows
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability',
      details: error.message
    });
  }
});

module.exports = router;
