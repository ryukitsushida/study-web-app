import type { ErrorHandler } from "hono";
import { AppError } from "../errors.js";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json({ detail: err.detail }, err.statusCode as 400);
  }
  console.error("Unhandled error:", err);
  return c.json({ detail: "Internal server error" }, 500);
};
