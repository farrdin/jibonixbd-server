import { z } from 'zod'

export const createVolunteerValidationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().optional(),
  photo: z.string().optional(),
  phone: z.string().optional(),
  nid_number: z.string().nullable().optional(),
  address: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),

  // Volunteer-specific fields
  skills: z
    .array(z.enum(['MEDICAL', 'LOGISTICS', 'RESCUE', 'DISTRIBUTION']))
    .optional(),
  preferred_locations: z.string().optional(),
  availability_time: z.string().optional()
})
