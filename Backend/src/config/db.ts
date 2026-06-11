// Backend/src/config/db.ts

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:             '127.0.0.1',
  port:             3307,
  user:             'root',
  password:         'root',
  database:         'coconut_disease_db',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

export default pool;