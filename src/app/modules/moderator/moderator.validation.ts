import { z } from 'zod'

export const createModeratorValidationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().optional(),
  photo: z.string().optional(),
  phone: z.string().optional(),
  nid_number: z.string().nullable().optional(),
  address: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  assigned_region: z.string().optional(),
  can_verify_victims: z.boolean().default(false)
})
