import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('確定要取消此預訂嗎？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: '用戶取消' })
      });

      const data = await response.json();
      if (data.success) {
        alert(`已取消預訂，退款金額：${data.currency} $${data.refundAmount}`);
        fetchBookings();
      } else {
        alert(data.error || '取消失敗');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('取消失敗');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return booking.status === 'CONFIRMED' && new Date(booking.date) > new Date();
    }
    if (filter === 'past') {
      return booking.status === 'COMPLETED' || new Date(booking.date) < new Date();
    }
    if (filter === 'cancelled') {
      return booking.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="my-bookings-page">
      <div className="bookings-header">
        <h1>我的預訂</h1>
        <Link to="/products" className="browse-button">
          瀏覽更多產品
        </Link>
      </div>

      <div className="bookings-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          全部 ({bookings.length})
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          即將到來
        </button>
        <button
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          已完成
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          已取消
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>載入中...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>還沒有預訂記錄</h3>
            <p>探索精彩的旅遊產品，開始您的旅程</p>
            <Link to="/products" className="explore-button">
              探索產品
            </Link>
          </div>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className={`booking-card status-${booking.status.toLowerCase()}`}>
              <div className="booking-main">
                <div className="booking-image">
                  <img
                    src="/placeholder-image.jpg"
                    alt={booking.productTitle}
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                  />
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="booking-details">
                  <h3>{booking.productTitle}</h3>
                  <p className="product-type">{getTypeLabel(booking.productType)}</p>
                  
                  <div className="booking-info">
                    <div className="info-row">
                      <span className="label">📍 目的地：</span>
                      <span className="value">{booking.destination || '未指定'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📅 日期：</span>
                      <span className="value">{new Date(booking.date).toLocaleDateString('zh-HK')}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">🏢 供應商：</span>
                      <span className="value">{booking.supplierName}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📝 預訂編號：</span>
                      <span className="value">{booking.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <div className="price-info">
                    <span className="currency">{booking.currency}</span>
                    <span className="amount">${booking.totalPrice}</span>
                  </div>

                  <div className="action-buttons">
                    <Link to={`/bookings/${booking.id}`} className="btn-view">
                      查看詳情
                    </Link>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        取消預訂
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getStatusLabel = (status) => {
  const labels = {
    PENDING: '待處理',
    AWAITING_PAYMENT: '待付款',
    CONFIRMED: '已確認',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    EXPIRED: '已過期'
  };
  return labels[status] || status;
};

const getTypeLabel = (type) => {
  const labels = {
    activity: '活動體驗',
    itinerary: '行程套票',
    transport: '交通服務',
    accommodation: '住宿'
  };
  return labels[type] || type;
};

export default MyBookingsPage;
