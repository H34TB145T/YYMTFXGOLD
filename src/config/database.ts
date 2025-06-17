import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'zpjhpszw_fxgold_admin',
  password: process.env.DB_PASSWORD || 'Fxgold_admin123!@#',
  database: process.env.DB_NAME || 'zpjhpszw_fxgold',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });