import { z } from 'zod'

export const createAdminValidationSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  name: z.string({ required_error: 'Name is required' }),
  phone: z
    .string({ required_error: 'Phone is required' })
    .regex(
      /^(?:\+880)\d{10}$/,
      'Invalid phone number. It should start with +880 and be followed by 10 digits'
    ),
  photo: z.string().optional(),
  nid_number: z.string().optional(),
  address: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),

  // Admin-specific
  can_export_data: z.boolean().default(true),

  // Add verification method validation
  verification_method: z.enum(['email', 'phone'], {
    required_error: 'Verification method is required'
  })
})
