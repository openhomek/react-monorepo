import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, '請輸入電郵地址')
  .email('請輸入有效的電郵地址')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '請輸入密碼'),
  rememberMe: z.boolean(),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, '用戶名稱至少需要 2 個字元')
      .max(30, '用戶名稱不能超過 30 個字元'),
    email: emailSchema,
    password: z
      .string()
      .min(8, '密碼至少需要 8 個字元')
      .max(64, '密碼不能超過 64 個字元')
      .regex(/[A-Za-z]/, '密碼至少包含一個英文字母')
      .regex(/\d/, '密碼至少包含一個數字'),
    confirmPassword: z
      .string()
      .min(1, '請再次輸入密碼'),
    acceptTerms: z.boolean(),
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
  .refine(
    (values) => {
      return values.acceptTerms
    },
    {
      path: ['acceptTerms'],
      message: '請閱讀並同意服務條款',
    },
  )

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
