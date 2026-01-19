import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    setLoading(true);
    try {
      // Fetch featured products
      const productsResponse = await fetch('/api/products?page=1&size=6');
      const productsData = await productsResponse.json();
      if (productsData.success) {
        setProducts(productsData.items);
      }

      // Fetch destinations if available
      try {
        const destResponse = await fetch('/api/destinations');
        const destData = await destResponse.json();
        if (Array.isArray(destData)) {
          setDestinations(destData.slice(0, 6));
        }
      } catch (e) {
        console.log('Destinations API not available');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>歡迎來到 Touvel</h1>
          <p>探索世界，創造屬於你的旅行回憶</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">
              探索產品
            </Link>
            <Link to="/ai-itinerary" className="btn-secondary">
              🤖 AI 行程規劃
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>多元產品選擇</h3>
            <p>行程套票、活動體驗、交通服務，一站式預訂</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI 智能規劃</h3>
            <p>根據你的偏好自動生成完美行程</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>實時報價</h3>
            <p>透明價格，即時獲取最新優惠</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>安全可靠</h3>
            <p>認證供應商，預訂有保障</p>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="section-header">
          <h2>熱門產品</h2>
          <Link to="/products" className="view-all">
            查看全部 →
          </Link>
        </div>
        
        {loading ? (
          <p className="loading-text">載入中...</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <Link key={product.id} to={`/products/${product.id}`} className="product-card">
                <div className="product-image">
                  <img
                    src={product.thumbnailUrl || '/placeholder-image.jpg'}
                    alt={product.title}
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p>{product.shortDesc}</p>
                  <div className="product-footer">
                    <span className="rating">⭐ {product.rating || '新產品'}</span>
                    <span className="price">{product.currency} ${product.minPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>開始您的旅程</h2>
          <p>立即探索精彩的旅遊產品，或使用 AI 工具規劃您的完美行程</p>
          <div className="cta-buttons">
            <Link to="/products" className="cta-btn primary">
              瀏覽產品
            </Link>
            <Link to="/ai-itinerary" className="cta-btn secondary">
              AI 行程規劃
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
