import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '../../apis/auth'
import { refreshAccessToken } from '../../apis/http'
import {
  clearAccessToken,
  setAccessToken,
} from '../../auth/accessToken'
import authReducer, {
  initializeSession,
  loginAccount,
  logoutAccount,
  registerAccount,
} from './authSlice'

vi.mock('../../apis/auth', () => {
  return {
    getCurrentUserRequest: vi.fn(),
    loginRequest: vi.fn(),
    logoutRequest: vi.fn(),
    registerRequest: vi.fn(),
  }
})

vi.mock('../../apis/http', () => {
  return {
    refreshAccessToken: vi.fn(),
  }
})

vi.mock('../../auth/accessToken', () => {
  return {
    clearAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
  }
})

describe('认证状态', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(getCurrentUserRequest).mockReset()
    vi.mocked(loginRequest).mockReset()
    vi.mocked(logoutRequest).mockReset()
    vi.mocked(registerRequest).mockReset()
    vi.mocked(refreshAccessToken).mockReset()
    vi.mocked(clearAccessToken).mockReset()
    vi.mocked(setAccessToken).mockReset()
  })

  it('登录成功后把 Access Token 留在内存，并把用户放进 Redux', async () => {
    vi.mocked(loginRequest).mockResolvedValue({
      accessToken: 'access-token',
      user: {
        id: 'user-1',
        name: '小明',
        email: 'user@example.com',
      },
    })

    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    await store.dispatch(
      loginAccount({
        email: 'user@example.com',
        password: 'hello1234',
        rememberMe: false,
      }),
    )

    expect(loginRequest).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'hello1234',
      rememberMe: false,
    })
    expect(setAccessToken).toHaveBeenCalledWith('access-token')
    expect(store.getState().auth).toMatchObject({
      status: 'authenticated',
      user: {
        id: 'user-1',
        name: '小明',
        email: 'user@example.com',
      },
    })
  })

  it('页面刷新后先恢复 Access Token，再读取当前用户', async () => {
    vi.mocked(refreshAccessToken).mockResolvedValue(
      'restored-access-token',
    )
    vi.mocked(getCurrentUserRequest).mockResolvedValue({
      id: 'user-1',
      name: '小明',
      email: 'user@example.com',
    })

    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    await store.dispatch(initializeSession())

    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(getCurrentUserRequest).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.status).toBe('authenticated')
    expect(store.getState().auth.user?.id).toBe('user-1')
  })

  it('完成三步註冊後把驗證憑證交給 API 並建立會話', async () => {
    vi.mocked(registerRequest).mockResolvedValue({
      accessToken: 'registered-access-token',
      user: {
        id: 'user-2',
        name: 'new',
        email: 'new@example.com',
      },
    })

    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    await store.dispatch(
      registerAccount({
        email: 'new@example.com',
        password: 'hello1234',
        registrationToken: 'verified-email-token',
      }),
    )

    expect(registerRequest).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'hello1234',
      registrationToken: 'verified-email-token',
    })
    expect(setAccessToken).toHaveBeenCalledWith(
      'registered-access-token',
    )
    expect(store.getState().auth.status).toBe('authenticated')
  })

  it('退出成功后清理内存 Token 和 Redux 用户', async () => {
    vi.mocked(loginRequest).mockResolvedValue({
      accessToken: 'access-token',
      user: {
        id: 'user-1',
        name: '小明',
        email: 'user@example.com',
      },
    })
    vi.mocked(logoutRequest).mockResolvedValue()

    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    await store.dispatch(
      loginAccount({
        email: 'user@example.com',
        password: 'hello1234',
        rememberMe: false,
      }),
    )
    await store.dispatch(logoutAccount())

    expect(clearAccessToken).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.status).toBe('anonymous')
    expect(store.getState().auth.user).toBeNull()
  })
})
