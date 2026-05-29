-- Delete any existing admin user first
DELETE FROM "User" WHERE email = 'admin@houseofcohort.com';

-- Create new admin user with proper password hash
-- Password: Admin123! hashed with bcrypt
INSERT INTO "User" (
    id,
    email,
    name,
    password,
    role,
    "isActive",
    "createdAt"
) VALUES (
    'admin_' || substr(md5(random()::text), 1, 20),
    'admin@houseofcohort.com',
    'House of Cohort Admin',
    '$2a$12$LQv3c1yqBwqVXJnrk5cX9e/T8JNlGzj8lKWjTXhQnJ5P1jVf8M6Rq',
    'ADMIN',
    true,
    NOW()
);