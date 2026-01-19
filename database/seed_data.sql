-- Sample Data Seed Script for Touvel Platform
-- PostgreSQL compatible

-- Start transaction
BEGIN;

-- Insert sample users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, country, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'traveler@example.com', '$2a$10$5zI8LKrXVvYQCWw3LXKQCeqEXJy9MqYL2LZN8KfFPPV1cqU6RQv.G', 'traveler', 'John', 'Doe', '+852-12345678', 'Hong Kong', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'supplier@example.com', '$2a$10$5zI8LKrXVvYQCWw3LXKQCeqEXJy9MqYL2LZN8KfFPPV1cqU6RQv.G', 'supplier', 'Jane', 'Smith', '+852-87654321', 'Hong Kong', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'admin@example.com', '$2a$10$5zI8LKrXVvYQCWw3LXKQCeqEXJy9MqYL2LZN8KfFPPV1cqU6RQv.G', 'admin', 'Admin', 'User', '+852-11111111', 'Hong Kong', 'active')
ON CONFLICT (id) DO NOTHING;
-- Password for all test users: password123

-- Insert sample supplier
INSERT INTO suppliers (id, user_id, company_name, contact_info, kyc_status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Amazing Tours HK', '{"email": "contact@amazingtours.com", "phone": "+852-87654321"}', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Insert sample destinations
INSERT INTO destinations (id, name, city, country, description, latitude, longitude, currency, is_featured) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddd01', 'Victoria Peak', 'Hong Kong', 'Hong Kong', 'Iconic mountain peak with stunning city views', 22.2783, 114.1747, 'HKD', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddd02', 'Disneyland Hong Kong', 'Hong Kong', 'Hong Kong', 'Magical theme park for all ages', 22.3132, 114.0413, 'HKD', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddd03', 'Lantau Island', 'Hong Kong', 'Hong Kong', 'Peaceful island with Big Buddha', 22.2585, 113.9430, 'HKD', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddd04', 'Central District', 'Hong Kong', 'Hong Kong', 'Bustling business and shopping district', 22.2819, 114.1580, 'HKD', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, supplier_id, type, title, short_desc, destination_id, duration_hours, status, tags) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'activity', 'Victoria Peak Sunset Tour', 'Experience breathtaking sunset views from Victoria Peak with round-trip tram tickets', 'dddddddd-dddd-dddd-dddd-dddddddddd01', 3, 'published', ARRAY['sunset', 'views', 'photography', 'iconic']),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'activity', 'Big Buddha & Lantau Island Day Trip', 'Full day excursion to Ngong Ping Village and the iconic Big Buddha statue', 'dddddddd-dddd-dddd-dddd-dddddddddd03', 8, 'published', ARRAY['culture', 'spiritual', 'cable car', 'full-day']),
  ('pppppppp-pppp-pppp-pppp-pppppppppp03', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'transport', 'Airport Express Transfer', 'Fast and convenient airport transfer service', 'dddddddd-dddd-dddd-dddd-dddddddddd04', 1, 'published', ARRAY['airport', 'transfer', 'convenient']),
  ('pppppppp-pppp-pppp-pppp-pppppppppp04', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'itinerary', '3-Day Hong Kong Highlights', 'Complete 3-day tour covering all major attractions', 'dddddddd-dddd-dddd-dddd-dddddddddd01', 72, 'published', ARRAY['multi-day', 'comprehensive', 'guided'])
ON CONFLICT (id) DO NOTHING;

-- Insert product content
INSERT INTO product_contents (id, product_id, locale, long_desc, images) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'pppppppp-pppp-pppp-pppp-pppppppppp01', 'en', 
   'Join us for an unforgettable evening at Victoria Peak! This 3-hour tour includes round-trip Peak Tram tickets, a professional guide, and plenty of time to capture stunning sunset photos. We''ll explore the Peak Tower, walk along the scenic Peak Circle Walk, and enjoy the spectacular views as the city lights up below. Perfect for photographers and couples!',
   '["https://images.unsplash.com/photo-1536599018102-9f803c140fc1", "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86"]'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'pppppppp-pppp-pppp-pppp-pppppppppp02', 'en',
   'Discover the spiritual side of Hong Kong on this full-day Lantau Island adventure. Travel by Ngong Ping 360 cable car to see the magnificent Tian Tan Buddha (Big Buddha), explore Po Lin Monastery, and visit the traditional fishing village of Tai O. Lunch included!',
   '["https://images.unsplash.com/photo-1559767949-0faa5c7e9992", "https://images.unsplash.com/photo-1589821991302-c4c3a0c3f1ec"]'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc03', 'pppppppp-pppp-pppp-pppp-pppppppppp03', 'en',
   'Skip the hassle of public transportation with our premium Airport Express Transfer service. Professional drivers, comfortable vehicles, and door-to-door service to any hotel in Hong Kong Island or Kowloon.',
   '["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d"]'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc04', 'pppppppp-pppp-pppp-pppp-pppppppppp04', 'en',
   'The ultimate Hong Kong experience! This 3-day guided tour covers Victoria Peak, Big Buddha, Disneyland, street markets, harbor cruises, and more. Includes all transportation, entrance fees, and most meals. Perfect for first-time visitors who want to see everything!',
   '["https://images.unsplash.com/photo-1536599018102-9f803c140fc1", "https://images.unsplash.com/photo-1559767949-0faa5c7e9992", "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86"]')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory slots for the next 30 days
DO $$
DECLARE
  current_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '30 days';
BEGIN
  WHILE current_date <= end_date LOOP
    -- Victoria Peak Sunset Tour - Daily at 16:00
    INSERT INTO inventory_slots (product_id, date, start_time, capacity, remaining, base_price, currency)
    VALUES ('pppppppp-pppp-pppp-pppp-pppppppppp01', current_date, '16:00:00', 20, 20, 580.00, 'HKD')
    ON CONFLICT (product_id, date, start_time) DO NOTHING;
    
    -- Big Buddha Day Trip - Daily at 09:00
    INSERT INTO inventory_slots (product_id, date, start_time, capacity, remaining, base_price, currency)
    VALUES ('pppppppp-pppp-pppp-pppp-pppppppppp02', current_date, '09:00:00', 30, 30, 1280.00, 'HKD')
    ON CONFLICT (product_id, date, start_time) DO NOTHING;
    
    -- Airport Transfer - Multiple times per day
    INSERT INTO inventory_slots (product_id, date, start_time, capacity, remaining, base_price, currency)
    VALUES ('pppppppp-pppp-pppp-pppp-pppppppppp03', current_date, '00:00:00', 50, 50, 350.00, 'HKD')
    ON CONFLICT (product_id, date, start_time) DO NOTHING;
    
    -- 3-Day Tour - Every Monday, Wednesday, Friday
    IF EXTRACT(DOW FROM current_date) IN (1, 3, 5) THEN
      INSERT INTO inventory_slots (product_id, date, start_time, capacity, remaining, base_price, currency)
      VALUES ('pppppppp-pppp-pppp-pppp-pppppppppp04', current_date, '09:00:00', 15, 15, 4800.00, 'HKD')
      ON CONFLICT (product_id, date, start_time) DO NOTHING;
    END IF;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END $$;

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppp01', '11111111-1111-1111-1111-111111111111', 5, 'Amazing sunset views!', 'The sunset from Victoria Peak was absolutely stunning. Our guide was knowledgeable and the tram ride was fun. Highly recommend!'),
  ('pppppppp-pppp-pppp-pppp-pppppppppp02', '11111111-1111-1111-1111-111111111111', 5, 'Spiritual and peaceful', 'Loved the Big Buddha and the cable car ride was incredible. The lunch was delicious too. Great value for money!')
ON CONFLICT DO NOTHING;

-- Insert sample promo code
INSERT INTO promo_codes (code, discount_type, discount_value, max_usage, start_date, end_date, min_booking_amount, is_active) VALUES
  ('WELCOME2024', 'percentage', 10.00, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 500.00, true),
  ('SUMMER50', 'fixed_amount', 50.00, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days', 1000.00, true)
ON CONFLICT (code) DO NOTHING;

COMMIT;

-- Verify data
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Suppliers:', COUNT(*) FROM suppliers
UNION ALL
SELECT 'Destinations:', COUNT(*) FROM destinations
UNION ALL
SELECT 'Products:', COUNT(*) FROM products
UNION ALL
SELECT 'Product Contents:', COUNT(*) FROM product_contents
UNION ALL
SELECT 'Inventory Slots:', COUNT(*) FROM inventory_slots
UNION ALL
SELECT 'Reviews:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Promo Codes:', COUNT(*) FROM promo_codes;
