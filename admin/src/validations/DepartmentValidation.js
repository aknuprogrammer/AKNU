import { z } from "zod";

export const departmentSchema = z.object({
  title: z.string().min(1, "This is a required field"),
  shortCode: z.string().min(1, "This is a required Field"),
  _id: z.string().optional(),
});
