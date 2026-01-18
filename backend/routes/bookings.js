const express = require('express');
const router = express.Router();
const db = require('../db');
// const auth = require('../middleware/auth');

// Get all bookings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [bookings] = await db.query(
      `SELECT b.*, d.name as destination FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       WHERE b.user_id = ?
       ORDER BY b.check_in DESC`,
      [userId]
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific booking
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [booking] = await db.query(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (!booking.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const { destination_id, check_in, check_out, number_of_guests, total_price } = req.body;
    const userId = req.user.id;

    const [result] = await db.query(
      `INSERT INTO bookings (user_id, destination_id, check_in, check_out, number_of_guests, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [userId, destination_id, check_in, check_out, number_of_guests, total_price]
    );

    res.status(201).json({
      id: result.insertId,
      destination_id,
      check_in,
      check_out,
      number_of_guests,
      total_price,
      status: 'confirmed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking
router.patch('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { check_in, check_out, number_of_guests, status } = req.body;

    const [result] = await db.query(
      `UPDATE bookings SET check_in = ?, check_out = ?, number_of_guests = ?, status = ?
       WHERE id = ?`,
      [check_in, check_out, number_of_guests, status, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete (cancel) booking
router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [result] = await db.query(
      `DELETE FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
