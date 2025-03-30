
-- This is a reference SQL function for checking measurements
-- Run this in the Supabase SQL editor to manually check for measurements

SELECT * FROM progreso
ORDER BY created_at DESC
LIMIT 10;

-- If you need to check for a specific user:
-- SELECT * FROM progreso WHERE cliente_id = 'your-user-id-here'
-- ORDER BY fecha DESC;
