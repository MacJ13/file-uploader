import "dotenv/config";

// const envFile =
//   process.env.NODE_ENV === "production"
//     ? ".env.production"
//     : ".env.development";

// dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const PORT = process.env.PORT ?? 3000;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const SESSION_SECRET = process.env.SESSION_SECRET as string;
