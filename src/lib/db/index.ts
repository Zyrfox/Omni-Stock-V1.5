import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL!;

const client = postgres(connectionString, { ssl: "require", max: 1 });
export const db = drizzle(client, { schema });
