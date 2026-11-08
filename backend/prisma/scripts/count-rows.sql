SELECT 'User' AS entity, COUNT(*)::int AS n FROM "User"
UNION ALL SELECT 'Route', COUNT(*)::int FROM "Route";
