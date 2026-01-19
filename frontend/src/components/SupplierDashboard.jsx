import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SupplierDashboard.css';

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/suppliers/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        const stats = {
          total: data.products.length,
          published: data.products.filter(p => p.status === 'published').length,
          draft: data.products.filter(p => p.status === 'draft').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supplier-dashboard">
      <div className="dashboard-header">
        <h1>供應商管理後台</h1>
        <Link to="/supplier/products/new" className="create-button">
          + 新增產品
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">總產品數</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.published}</div>
          <div className="stat-label">已發布</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.draft}</div>
          <div className="stat-label">草稿</div>
        </div>
      </div>

      <div className="products-section">
        <h2>我的產品</h2>
        
        {loading ? (
          <div className="loading">載入中...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>您還沒有任何產品</p>
            <Link to="/supplier/products/new">立即建立產品</Link>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>產品名稱</th>
                  <th>類型</th>
                  <th>目的地</th>
                  <th>狀態</th>
                  <th>預訂數量</th>
                  <th>庫存</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>{getTypeLabel(product.type)}</td>
                    <td>{product.destination || '-'}</td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td>{product.bookingsCount || 0}</td>
                    <td>{product.inventorySlotsCount || 0} 個時段</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/supplier/products/${product.id}/edit`} className="btn-edit">
                          編輯
                        </Link>
                        <Link to={`/supplier/products/${product.id}/inventory`} className="btn-inventory">
                          庫存
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

const getStatusLabel = (status) => {
  const labels = {
    draft: '草稿',
    pending_review: '審核中',
    published: '已發布',
    archived: '已封存'
  };
  return labels[status] || status;
};

export default SupplierDashboard;
