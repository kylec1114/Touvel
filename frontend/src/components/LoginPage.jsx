import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.accessToken);
      
      // Call onLogin with user data
      if (onLogin) {
        onLogin(data.user);
      }

      // Redirect based on role
      if (data.user.role === 'supplier') {
        navigate('/supplier/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
    // Trigger form submission after state update
    setTimeout(() => {
      document.querySelector('form').requestSubmit();
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>登入 Touvel</h1>
        <p className="subtitle">計劃您的下一次冒險</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">電郵地址</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="輸入您的電郵"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入您的密碼"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="test-accounts">
          <p className="test-title">測試帳號（快速登入）：</p>
          <div className="test-buttons">
            <button
              type="button"
              className="test-btn"
              onClick={() => handleTestLogin('traveler@example.com')}
            >
              旅客帳號
            </button>
            <button
              type="button"
              className="test-btn"
              onClick={() => handleTestLogin('supplier@example.com')}
            >
              供應商帳號
            </button>
          </div>
          <p className="test-hint">密碼：password123</p>
        </div>

        <p className="signup-link">
          還沒有帳號？ <a href="/register">立即註冊</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
