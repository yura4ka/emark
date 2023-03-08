import { z } from "zod";

export const validString = z.string().trim().min(1);
export const validId = z.number().positive().int();
export const validEmail = z.string().email();
