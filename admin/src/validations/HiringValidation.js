import { z } from "zod";

export const hiringNotificationSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  departmentId: z.string().min(1, "Department is required"),
  requiredExperience: z.string().min(1, "Experience is required"),
  requiredSkills: z.string().min(1, "Required skills are required"),
  openings: z.string().min(1, "Number of openings is required"),
  applicationDeadline: z.string().min(1, "Application deadline is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});
