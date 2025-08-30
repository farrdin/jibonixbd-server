import { z } from 'zod';

export const createDonationValidationSchema = z.object({
  donor_id: z.string({ required_error: 'Donor ID is required' }),

  disaster_id: z.string({ required_error: 'Disaster ID is required' }),

  type: z.enum(['MONEY', 'FOOD', 'CLOTHES', 'MEDICINE'], {
    required_error: 'Donation type is required',
  }),

  amount: z.number().nullable().optional(),

  quantity: z.number().int().nullable().optional(),

  donation_date: z.string({ required_error: 'Donation date is required' }),

  delivery: z.enum(['PICKUP', 'DROPOFF'], {
    required_error: 'Delivery method is required',
  }),

  status: z
    .enum(['PENDING', 'RECEIVED', 'DELIVERED'], {
      required_error: 'Donation status is required',
    })
    .default('PENDING'),

  transaction_id: z.string().nullable().optional(),
});
