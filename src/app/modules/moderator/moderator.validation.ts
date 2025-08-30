import { z } from 'zod';

export const createModeratorValidationSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  name: z.string({ required_error: 'Name is required' }),
  phone: z.string({ required_error: 'Phone is required' }),
  photo: z.string().optional(),
  nid_number: z.string().optional(),
  address: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),

  // Moderator-specific fields
  assigned_region: z.string().optional(),
  can_verify_victims: z.boolean().default(false),
});
