import { z } from 'zod'

export const createDonorValidationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().optional(),
  photo: z.string().optional(),
  phone: z.string().optional(),
  nid_number: z.string().optional(),
  address: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),

  // Donor-specific fields
  organization_name: z.string().optional(),
  donation_history: z.string().optional()
})
