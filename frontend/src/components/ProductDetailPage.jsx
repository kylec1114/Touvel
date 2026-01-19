import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [pax, setPax] = useState({ adult: 2, child: 0 });
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState('select'); // select, quote, booking

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    const fromDate = selectedDate;
    const toDate = new Date(selectedDate);
    toDate.setDate(toDate.getDate() + 7);
    
    try {
      const response = await fetch(
        `/api/products/${id}/availability?from=${fromDate}&to=${toDate.toISOString().split('T')[0]}`
      );
      const data = await response.json();
      if (data.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleGetQuote = async () => {
    if (!selectedDate) {
      alert('請選擇日期');
      return;
    }

    setQuoteLoading(true);
    try {
      const response = await fetch('/api/bookings/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          date: selectedDate,
          pax: [
            { type: 'adult', qty: pax.adult },
            { type: 'child', qty: pax.child }
          ].filter(p => p.qty > 0)
        })
      });

      const data = await response.json();
      if (data.success) {
        setQuote(data);
        setBookingStep('quote');
      } else {
        alert(data.error || '無法獲取報價');
      }
    } catch (error) {
      console.error('Error getting quote:', error);
      alert('獲取報價失敗');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入');
      navigate('/login');
      return;
    }

    const userInfo = {
      name: prompt('請輸入您的姓名：'),
      email: prompt('請輸入您的電郵：'),
      phone: prompt('請輸入您的電話：')
    };

    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      alert('請填寫完整資料');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quoteId: quote.quoteId,
          userInfo,
          paymentMode: 'pay_now'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`預訂成功！預訂編號：${data.bookingId}`);
        navigate('/my-bookings');
      } else {
        alert(data.error || '預訂失敗');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('預訂失敗');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="error-container">產品不存在</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-main">
          <div className="product-images">
            <div className="main-image">
              <img
                src={product.images?.[0] || '/placeholder-image.jpg'}
                alt={product.title}
                onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`${product.title} ${idx + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="product-content">
            <h1>{product.title}</h1>
            
            <div className="product-meta">
              <span className="rating">⭐ {product.rating}</span>
              <span className="reviews">({product.reviewsCount} 評價)</span>
              <span className="location">📍 {product.destination}</span>
              <span className="supplier">提供商：{product.supplier.name}</span>
            </div>

            <div className="product-description">
              <h2>產品描述</h2>
              <p>{product.longDesc || product.shortDesc}</p>
            </div>

            {product.itinerary && (
              <div className="product-itinerary">
                <h2>行程安排</h2>
                <div className="itinerary-content">
                  {JSON.stringify(product.itinerary, null, 2)}
                </div>
              </div>
            )}

            {product.policies && (
              <div className="product-policies">
                <h2>預訂政策</h2>
                <pre>{JSON.stringify(product.policies, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="booking-sidebar">
          <div className="booking-card">
            <h3>立即預訂</h3>
            
            {bookingStep === 'select' && (
              <>
                <div className="form-group">
                  <label>選擇日期</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>成人數量</label>
                  <div className="quantity-selector">
                    <button onClick={() => setPax(p => ({ ...p, adult: Math.max(1, p.adult - 1) }))}>-</button>
                    <span>{pax.adult}</span>
                    <button onClick={() => setPax(p => ({ ...p, adult: p.adult + 1 }))}>+</button>
                  </div>
                </div>

                <div className="form-group">
                  <label>兒童數量</label>
                  <div className="quantity-selector">
                    <button onClick={() => setPax(p => ({ ...p, child: Math.max(0, p.child - 1) }))}>-</button>
                    <span>{pax.child}</span>
                    <button onClick={() => setPax(p => ({ ...p, child: p.child + 1 }))}>+</button>
                  </div>
                </div>

                {availability.length > 0 && (
                  <div className="availability-info">
                    <p>✅ 此日期可預訂</p>
                    <p>剩餘名額：{availability[0]?.remaining}</p>
                  </div>
                )}

                <button
                  className="get-quote-button"
                  onClick={handleGetQuote}
                  disabled={quoteLoading || !selectedDate}
                >
                  {quoteLoading ? '計算中...' : '獲取報價'}
                </button>
              </>
            )}

            {bookingStep === 'quote' && quote && (
              <div className="quote-summary">
                <h4>報價詳情</h4>
                <div className="quote-breakdown">
                  {quote.breakdown.map((item, idx) => (
                    <div key={idx} className="quote-item">
                      <span>{item.type || item.name} x {item.qty}</span>
                      <span>{quote.currency} ${item.subtotal}</span>
                    </div>
                  ))}
                </div>
                <div className="quote-total">
                  <strong>總計：</strong>
                  <strong>{quote.currency} ${quote.total}</strong>
                </div>
                <p className="quote-validity">
                  有效期至：{new Date(quote.validUntil).toLocaleString()}
                </p>
                <button className="book-button" onClick={handleCreateBooking}>
                  確認預訂
                </button>
                <button className="back-button" onClick={() => setBookingStep('select')}>
                  返回修改
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
