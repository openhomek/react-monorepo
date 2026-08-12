import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  registrationCodeSchema,
  registrationEmailSchema,
  registrationPasswordSchema,
} from './authSchemas'

describe('登录表单规则', () => {
  it('清理邮箱两端空格并转成小写', () => {
    const result = loginSchema.parse({
      email: '  User@Example.COM  ',
      password: 'hello1234',
      rememberMe: false,
    })

    expect(result.email).toBe('user@example.com')
  })

  it('拒绝空密码', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
      rememberMe: false,
    })

    expect(result.success).toBe(false)
  })
})

describe('註冊三步表單規則', () => {
  it('第一步清理電郵並要求同意條款', () => {
    const result = registrationEmailSchema.parse({
      email: '  User@Example.COM ',
      acceptTerms: true,
    })

    expect(result.email).toBe('user@example.com')
  })

  it('第一步拒絕未同意條款', () => {
    const result = registrationEmailSchema.safeParse({
      email: 'user@example.com',
      acceptTerms: false,
    })

    expect(result.success).toBe(false)
  })

  it('第二步只接受六位數字驗證碼', () => {
    expect(
      registrationCodeSchema.safeParse({ code: '123456' }).success,
    ).toBe(true)
    expect(
      registrationCodeSchema.safeParse({ code: '12a456' }).success,
    ).toBe(false)
  })

  it('第三步接受符合要求且兩次一致的密碼', () => {
    const result = registrationPasswordSchema.safeParse({
      password: 'hello1234',
      confirmPassword: 'hello1234',
    })

    expect(result.success).toBe(true)
  })

  it('第三步把密碼不一致錯誤放在確認欄位', () => {
    const result = registrationPasswordSchema.safeParse({
      password: 'hello1234',
      confirmPassword: 'different1234',
    })

    expect(result.success).toBe(false)

    if (result.success === false) {
      const confirmPasswordIssue = result.error.issues.find(
        (issue) => issue.path[0] === 'confirmPassword',
      )

      expect(confirmPasswordIssue?.message).toBe(
        '兩次輸入的密碼不一致',
      )
    }
  })
})
