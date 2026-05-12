import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,   // disabilitato perché è database locale
});

export const db = drizzle(pool, { schema });

// Test di connessione al avvio
pool.connect()
  .then(() => {
    console.log("✅ Connesso correttamente al database PostgreSQL locale (petconnect)");
  })
  .catch((err) => {
    console.error("❌ Errore di connessione al database:", err.message);
  });

export default db;