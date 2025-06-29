import * as dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: envFile });

export const PORT = process.env.PORT ?? 3000;
export const DB_URL = process.env.DB_URL!;
