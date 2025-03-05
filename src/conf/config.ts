import dotenv from "dotenv";
// dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: "postgres",
  dialectOptions: {
    connectTimeout: 60000,  // 1 minute for establishing connection
    statement_timeout: 600000,  // 10 minutes for query execution timeout
  },
  pool: {
    max: 100,  // Increased pool size
    min: 0,
    acquire: 600000,  // 10 minutes to acquire a connection from the pool
    idle: 10000,  // 10 seconds idle timeout
  },
}
