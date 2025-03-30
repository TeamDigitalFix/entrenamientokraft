
-- This is a reference SQL function for checking measurements
-- Run this in the Supabase SQL editor to manually check for measurements

-- Check all measurement records to see what's in the database
SELECT * FROM progreso
ORDER BY created_at DESC
LIMIT 10;

-- Check table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'progreso';

-- Get specific client measurements
-- Replace 'your-user-id-here' with an actual client ID
SELECT * FROM progreso 
WHERE cliente_id = 'your-user-id-here'
ORDER BY fecha DESC;
