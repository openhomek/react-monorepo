import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, '請輸入電郵地址')
  .email('請輸入有效的電郵地址')

export const loginEmailSchema = z.object({
  email: emailSchema,
})

export const loginPasswordSchema = z.object({
  password: z.string().min(1, '請輸入密碼'),
  rememberMe: z.boolean(),
})

export const loginSchema = loginEmailSchema.extend({
  password: loginPasswordSchema.shape.password,
  rememberMe: loginPasswordSchema.shape.rememberMe,
})

export const registrationEmailSchema = z
  .object({
    email: emailSchema,
    acceptTerms: z.boolean(),
  })
  .refine(
    (values) => {
      return values.acceptTerms
    },
    {
      path: ['acceptTerms'],
      message: '請閱讀並同意使用條款及私隱政策',
    },
  )

export const registrationCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, '請輸入六位數字驗證碼'),
})

export const registrationPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '密碼至少需要 8 個字元')
      .max(64, '密碼不能超過 64 個字元')
      .regex(/[A-Za-z]/, '密碼至少包含一個英文字母')
      .regex(/\d/, '密碼至少包含一個數字'),
    confirmPassword: z
      .string()
      .min(1, '請再次輸入密碼'),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword
    },
    {
      path: ['confirmPassword'],
      message: '兩次輸入的密碼不一致',
    },
  )

export type LoginFormValues = z.infer<typeof loginSchema>
export type LoginEmailFormValues = z.infer<typeof loginEmailSchema>
export type LoginPasswordFormValues = z.infer<
  typeof loginPasswordSchema
>
export type RegistrationEmailFormValues = z.infer<
  typeof registrationEmailSchema
>
export type RegistrationCodeFormValues = z.infer<
  typeof registrationCodeSchema
>
export type RegistrationPasswordFormValues = z.infer<
  typeof registrationPasswordSchema
>
