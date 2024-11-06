import dotenv from "dotenv";
// dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: "postgres",
  pool: {
    acquire: 600000,  // 10 minutes (600,000 ms)
    max: 100,          // Max number of connections
    min: 0,           // Min number of connections
    idle: 10000       // Idle timeout for connections
  }
}
