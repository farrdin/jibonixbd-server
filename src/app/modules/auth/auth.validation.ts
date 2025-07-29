import { z } from 'zod'

const loginValidationSchema = z.object({
  email: z
    .string({
      required_error: 'Email must be a string'
    })
    .email(),
  password: z
    .string({
      required_error:
        'Password must Requied as string and at least 6 characters'
    })
    .min(6)
})

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z.string({ required_error: 'New password is required' })
  })
})

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema
}
