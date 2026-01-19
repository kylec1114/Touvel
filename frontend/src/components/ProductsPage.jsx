import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    type: '',
    destination: '',
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: '',
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [filters, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      queryParams.append('page', page);
      queryParams.append('size', 12);

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>探索旅遊產品</h1>
        <p>尋找最適合您的行程、活動和交通服務</p>
      </div>

      <div className="search-filters">
        <form onSubmit={handleSearch} className="filter-form">
          <input
            type="text"
            name="q"
            placeholder="搜尋產品..."
            value={filters.q}
            onChange={handleFilterChange}
            className="search-input"
          />

          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">所有類型</option>
            <option value="activity">活動體驗</option>
            <option value="itinerary">行程套票</option>
            <option value="transport">交通服務</option>
            <option value="accommodation">住宿</option>
          </select>

          <div className="price-range">
            <input
              type="number"
              name="minPrice"
              placeholder="最低價格"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="price-input"
            />
            <span>-</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="最高價格"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="price-input"
            />
          </div>

          <div className="date-range">
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="date-input"
            />
            <span>至</span>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="date-input"
            />
          </div>

          <button type="submit" className="search-button">
            搜尋
          </button>
        </form>
      </div>

      <div className="products-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>載入中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <p>沒有找到符合條件的產品</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="product-card"
                >
                  <div className="product-image">
                    <img
                      src={product.thumbnailUrl || '/placeholder-image.jpg'}
                      alt={product.title}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <span className="product-type">{getTypeLabel(product.type)}</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="product-description">{product.shortDesc}</p>
                    <div className="product-details">
                      {product.destination && (
                        <span className="destination">📍 {product.destination}</span>
                      )}
                      {product.durationDays > 0 && (
                        <span className="duration">🕐 {product.durationDays} 天</span>
                      )}
                      {product.durationHours > 0 && !product.durationDays && (
                        <span className="duration">🕐 {product.durationHours} 小時</span>
                      )}
                    </div>
                    <div className="product-footer">
                      <div className="rating">
                        ⭐ {product.rating || '新產品'}
                        {product.reviewsCount > 0 && (
                          <span className="review-count">({product.reviewsCount})</span>
                        )}
                      </div>
                      <div className="price">
                        <span className="from">由</span>
                        <span className="amount">
                          {product.currency} ${product.minPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="page-button"
              >
                上一頁
              </button>
              <span className="page-info">
                第 {page} 頁，共 {Math.ceil(total / 12)} 頁
              </span>
              <button
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => setPage(p => p + 1)}
                className="page-button"
              >
                下一頁
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
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

export default ProductsPage;
