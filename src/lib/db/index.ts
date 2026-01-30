import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Missing DATABASE_URL");

const client = postgres(url, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
});

export const db = drizzle(client);
