import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";
import "dotenv/config"

const envSchema = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().min(1, { message: "BASE_URL is required" }),
    NEXT_PUBLIC_HMAC_SECRET:z.string().min(1,{message:"HMAC_SECRET is required"}),
    NEXT_PUBLIC_KEY:z.string().min(1,{message:"PUBLIC_KEY is required"})
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_HMAC_SECRET:process.env.NEXT_PUBLIC_HMAC_SECRET,
    NEXT_PUBLIC_KEY:process.env.NEXT_PUBLIC_KEY
  },
});

const env = envSchema


export default env;
