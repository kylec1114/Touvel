import { useState, useEffect } from 'react';
import './BookingsPage.css';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token) {
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/bookings/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="bookings-container"><p>Loading...</p></div>;
  }

  return (
    <div className="bookings-container">
      <h1>My Bookings</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h2>{booking.destination}</h2>
                <span className={`status ${booking.status}`}>{booking.status}</span>
              </div>
              <div className="booking-details">
                <p><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
                <p><strong>Total Price:</strong> ${booking.totalPrice}</p>
              </div>
              <button
                onClick={() => cancelBooking(booking.id)}
                className="cancel-button"
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
