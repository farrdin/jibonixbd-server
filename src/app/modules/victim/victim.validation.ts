import { z } from 'zod'

export const createVictimValidationSchema = z.object({
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

  // Victim-specific fields
  location: z.string().optional(),
  is_verified: z.boolean().nullable().default(false),
  total_requests_made: z
    .number()
    .nonnegative({ message: 'Total requests must be a non-negative number' })
    .nullable()
    .default(0)
})
