import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DB_URL,
  max: 4,
});

export const getClient = () => pool.connect();
