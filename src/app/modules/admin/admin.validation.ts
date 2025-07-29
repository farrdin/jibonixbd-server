import { z } from 'zod'

export const createAdminValidationSchema = z.object({
  name: z.string().optional(),
  email: z.string({ required_error: 'Email is required' }).email(),
  photo: z.string().optional(),
  phone: z.string().optional(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  nid_number: z.string().nullable().optional(),
  address: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),

  // Admin-specific
  can_export_data: z.boolean().default(true)
})
