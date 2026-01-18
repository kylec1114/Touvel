const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const [destinations] = await db.query('SELECT * FROM destinations');
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [destination] = await db.query(
      'SELECT * FROM destinations WHERE id = ?',
      [id]
    );

    if (!destination.length) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search destinations
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchQuery = `%${query}%`;

    const [destinations] = await db.query(
      `SELECT * FROM destinations 
       WHERE name LIKE ? OR description LIKE ? OR location LIKE ?`,
      [searchQuery, searchQuery, searchQuery]
    );

    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured destinations
router.get('/featured/true', async (req, res) => {
  try {
    const [destinations] = await db.query(
      'SELECT * FROM destinations WHERE featured = 1 LIMIT 6'
    );
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
