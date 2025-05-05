import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// This is the correct way neon config - DO NOT change this
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Số kết nối tối đa trong pool
  idleTimeoutMillis: 30000, // Thời gian timeout khi không hoạt động (30 giây)
  connectionTimeoutMillis: 5000 // Thời gian timeout khi kết nối (5 giây)
});
export const db = drizzle({ client: pool, schema });