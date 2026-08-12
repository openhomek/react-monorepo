import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  registerSchema,
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

describe('注册表单规则', () => {
  it('接受满足要求且两次一致的密码', () => {
    const result = registerSchema.safeParse({
      name: '小明',
      email: 'user@example.com',
      password: 'hello1234',
      confirmPassword: 'hello1234',
      acceptTerms: true,
    })

    expect(result.success).toBe(true)
  })

  it('把密码不一致的错误放在确认密码字段', () => {
    const result = registerSchema.safeParse({
      name: '小明',
      email: 'user@example.com',
      password: 'hello1234',
      confirmPassword: 'different1234',
      acceptTerms: true,
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

  it('拒绝没有同意服务条款的注册数据', () => {
    const result = registerSchema.safeParse({
      name: '小明',
      email: 'user@example.com',
      password: 'hello1234',
      confirmPassword: 'hello1234',
      acceptTerms: false,
    })

    expect(result.success).toBe(false)
  })
})
