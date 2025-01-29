const { Pool } = require('pg'); // Import PostgreSQL client

// Load environment variables
require('dotenv').config();

// Create a PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error', err);
    } else {
        console.log('Connected to PostgreSQL:', res.rows[0].now);
    }
});

module.exports = pool;
