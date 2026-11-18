import { z } from "zod";

export const uploadLetterValidation = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  letterCode: z.string().optional(),
  description: z.string().max(200, "Description must be within 200 characters").optional(),
  file: z.any()
    .refine((files) => files?.length > 0, "Template file is required")
    .refine((files) => files?.[0]?.size <= 500 * 1024, "Max file size allowed is 500KB")
    .refine(
      (files) => ["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(files?.[0]?.type),
      "Only PDF, PNG, JPEG and JPG formats are supported"
    ),
});

export const requestLetterValidation = z.object({
  name: z.string().min(3, "Name must be atleast 3 charecters long"),
  email: z.string().email("Enter a valid email address"),
  department: z.string().min(1, "Select Department"),
  campus: z.string().min(1, "Select Campus"),
  facultyId: z.string().min(1, "Enter a valid Id"),
  reason: z.string().min(1, "Enter a valid Reason"),
  authorization: z.boolean().refine((val) => val === true, {
    message: "You must agree to this confirmation",
  }),
});
