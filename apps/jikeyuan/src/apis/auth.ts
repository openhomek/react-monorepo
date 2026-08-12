import { privateHttp, publicHttp } from './http'

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthSession {
  accessToken: string
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
  // 后端据此决定 Refresh Token Cookie 是会话 Cookie 还是持久 Cookie。
  rememberMe: boolean
}

export interface RegisterPayload {
  email: string
  password: string
  registrationToken: string
}

export interface RequestRegistrationCodePayload {
  email: string
}

export interface VerifyRegistrationCodePayload {
  email: string
  code: string
}

interface AuthSessionResponse {
  data: AuthSession
}

interface CurrentUserResponse {
  data: {
    user: AuthUser
  }
}

interface RegistrationVerificationResponse {
  data: {
    registrationToken: string
  }
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<AuthSession> {
  const response = await publicHttp.post<AuthSessionResponse>(
    '/auth/login',
    payload,
  )

  return response.data.data
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<AuthSession> {
  const response = await publicHttp.post<AuthSessionResponse>(
    '/auth/register',
    payload,
  )

  return response.data.data
}

export async function requestRegistrationCodeRequest(
  payload: RequestRegistrationCodePayload,
): Promise<void> {
  await publicHttp.post('/auth/register/send-code', payload)
}

export async function verifyRegistrationCodeRequest(
  payload: VerifyRegistrationCodePayload,
): Promise<string> {
  const response =
    await publicHttp.post<RegistrationVerificationResponse>(
      '/auth/register/verify-code',
      payload,
    )

  const registrationToken =
    response.data.data.registrationToken.trim()

  if (registrationToken.length === 0) {
    throw new Error('驗證接口沒有返回有效註冊憑證')
  }

  return registrationToken
}

export async function getCurrentUserRequest(): Promise<AuthUser> {
  const response = await privateHttp.get<CurrentUserResponse>(
    '/auth/me',
  )

  return response.data.data.user
}

export async function logoutRequest(): Promise<void> {
  await privateHttp.post('/auth/logout')
}
