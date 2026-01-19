import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIItineraryGenerator.css';

const AIItineraryGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    budget: 5000,
    currency: 'HKD',
    interests: []
  });
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);

  const interestOptions = [
    { value: 'culture', label: '文化歷史' },
    { value: 'food', label: '美食' },
    { value: 'nature', label: '自然風光' },
    { value: 'adventure', label: '冒險活動' },
    { value: 'shopping', label: '購物' },
    { value: 'nightlife', label: '夜生活' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入');
      navigate('/login');
      return;
    }

    if (!formData.destination) {
      alert('請輸入目的地');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/itineraries/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: formData.destination,
          days: parseInt(formData.days),
          budget: parseFloat(formData.budget),
          currency: formData.currency,
          preferences: { interests: formData.interests }
        })
      });

      const data = await response.json();
      if (data.success) {
        setItinerary(data);
      } else {
        alert(data.error || '生成行程失敗');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('生成行程失敗');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="ai-itinerary-generator">
      <div className="generator-header">
        <h1>🤖 AI 智能行程生成器</h1>
        <p>讓 AI 為您規劃完美的旅程</p>
      </div>

      <div className="generator-container">
        <div className="generator-form">
          <h2>設定您的旅行偏好</h2>

          <div className="form-group">
            <label>目的地 *</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="例如：香港、東京、巴黎"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>旅行天數</label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                min="1"
                max="30"
              />
            </div>

            <div className="form-group">
              <label>預算 ({formData.currency})</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label>選擇貨幣</label>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="HKD">港幣 (HKD)</option>
              <option value="USD">美元 (USD)</option>
              <option value="CNY">人民幣 (CNY)</option>
              <option value="EUR">歐元 (EUR)</option>
              <option value="JPY">日圓 (JPY)</option>
            </select>
          </div>

          <div className="form-group">
            <label>興趣愛好（可多選）</label>
            <div className="interests-grid">
              {interestOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`interest-button ${formData.interests.includes(option.value) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? '生成中...' : '✨ 生成行程'}
          </button>
        </div>

        {itinerary && (
          <div className="itinerary-result">
            <h2>生成的行程</h2>
            
            <div className="itinerary-info">
              <div className="info-item">
                <span className="label">目的地：</span>
                <span className="value">{itinerary.jsonPlan.destination}</span>
              </div>
              <div className="info-item">
                <span className="label">天數：</span>
                <span className="value">{itinerary.jsonPlan.days} 天</span>
              </div>
              <div className="info-item">
                <span className="label">預算：</span>
                <span className="value">
                  {itinerary.jsonPlan.currency} ${itinerary.jsonPlan.estimatedTotalCost}
                </span>
              </div>
            </div>

            <div className="daily-itineraries">
              {itinerary.jsonPlan.dailyItineraries.map((day, idx) => (
                <div key={idx} className="day-card">
                  <h3>第 {day.day} 天 - {day.theme}</h3>
                  <div className="activities-list">
                    {day.activities.map((activity, actIdx) => (
                      <div key={actIdx} className="activity-item">
                        <span className="time">{activity.time}</span>
                        <div className="activity-content">
                          <strong>{activity.name}</strong>
                          <p>{activity.description}</p>
                          <span className="cost">
                            預估費用：${activity.estimatedCost}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="itinerary-actions">
              <button className="save-button">
                💾 儲存行程
              </button>
              <button className="attach-products-button">
                🔗 關聯產品
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIItineraryGenerator;
