import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/destinations');
      const data = await response.json();
      setDestinations(data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Touvel</h1>
          <p>Plan your next adventure</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <button>Search</button>
          </div>
        </div>
      </section>

      <section className="destinations-grid">
        <h2>Popular Destinations</h2>
        {loading ? (
          <p>Loading destinations...</p>
        ) : (
          <div className="grid">
            {filteredDestinations.map(dest => (
              <Link key={dest.id} to={`/destination/${dest.id}`} className="destination-card">
                <img src={dest.image} alt={dest.name} />
                <div className="card-content">
                  <h3>{dest.name}</h3>
                  <p>{dest.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
