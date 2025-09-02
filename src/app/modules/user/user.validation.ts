import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  photo: z.string().url('Photo must be a valid URL').optional(),
  nid_number: z
    .string()
    .min(10, 'NID number must be at least 10 digits')
    .optional(),
  address: z.string().min(1, 'Address is required').optional(),
  division: z.string().min(1, 'Division is required').optional(),
  district: z.string().min(1, 'District is required').optional(),
  upazila: z.string().min(1, 'Upazila is required').optional(),
  role: z
    .enum(['VICTIM', 'VOLUNTEER', 'DONOR', 'MODERATOR', 'ADMIN'])
    .optional()
    .default('VICTIM'),
  is_verified: z.boolean().optional().default(false),
});
