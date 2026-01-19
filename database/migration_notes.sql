-- Migration Helper: Convert MySQL schema to PostgreSQL
-- This script helps transition from the original MySQL schema to the enhanced PostgreSQL schema

-- =====================================================
-- STEP 1: Backup your existing data before migration
-- =====================================================

-- For MySQL:
-- mysqldump -u root -p touvel_db > touvel_backup.sql

-- =====================================================
-- STEP 2: Create new PostgreSQL database
-- =====================================================

-- createdb touvel_db

-- =====================================================
-- STEP 3: Run the enhanced schema
-- =====================================================

-- psql -d touvel_db -f database/schema_enhanced.sql

-- =====================================================
-- STEP 4: Migrate existing data (if applicable)
-- =====================================================

-- If you have existing MySQL data, you can use pg_loader or manual migration
-- Example manual migration queries:

-- Migrate users from old schema to new schema with UUIDs
-- Note: This assumes you have a way to generate UUIDs for existing integer IDs

-- CREATE TEMPORARY TABLE old_users_mapping (
--   old_id INT,
--   new_id UUID DEFAULT gen_random_uuid()
-- );

-- INSERT INTO old_users_mapping (old_id)
-- SELECT id FROM old_users_table;

-- INSERT INTO users (id, email, password_hash, first_name, last_name, phone, country, role)
-- SELECT m.new_id, o.email, o.password, o.first_name, o.last_name, o.phone, o.country, 
--        COALESCE(o.role, 'traveler')
-- FROM old_users_table o
-- JOIN old_users_mapping m ON o.id = m.old_id;

-- =====================================================
-- STEP 5: Update application configuration
-- =====================================================

-- Update backend/db.js to use PostgreSQL connection
-- Update .env with DATABASE_URL for PostgreSQL

-- Example DATABASE_URL:
-- DATABASE_URL=postgresql://user:password@localhost:5432/touvel_db

-- =====================================================
-- STEP 6: Verify migration
-- =====================================================

-- Check table counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'destinations', COUNT(*) FROM destinations;

-- =====================================================
-- Migration Notes
-- =====================================================

-- Key differences from MySQL to PostgreSQL:
-- 1. Auto-increment INT → UUID with gen_random_uuid()
-- 2. ENUM types defined in CHECK constraints
-- 3. JSON → JSONB for better performance
-- 4. Triggers for updated_at columns
-- 5. Better indexing support (GIN for arrays/JSONB)

-- Compatibility Notes:
-- - The old MySQL schema is still functional
-- - The new schema is optimized for PostgreSQL features
-- - Both can coexist during transition period
-- - Update queries from mysql2 to pg in Node.js:
--   * Positional parameters: ? → $1, $2, etc.
--   * Query results: rows[0] in pg vs mysql2 array destructuring

-- =====================================================
-- Testing Post-Migration
-- =====================================================

-- Test basic CRUD operations:
-- 1. Create a test user
-- 2. Create a test product
-- 3. Create a test booking
-- 4. Verify all foreign keys work correctly

-- Example test queries:
-- INSERT INTO users (email, password_hash, role) 
-- VALUES ('test@example.com', 'hashed_password', 'traveler');

-- SELECT * FROM users WHERE email = 'test@example.com';
