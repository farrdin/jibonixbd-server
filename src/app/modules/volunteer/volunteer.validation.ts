import { z } from 'zod'

export const createVolunteerValidationSchema = z.object({
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

  // Volunteer-specific fields
  skills: z.array(z.enum(['MEDICAL', 'LOGISTICS', 'RESCUE', 'DISTRIBUTION'])),
  preferred_locations: z.string({
    required_error: 'Preferred locations are required'
  }),
  availability_time: z.string().optional()
})
