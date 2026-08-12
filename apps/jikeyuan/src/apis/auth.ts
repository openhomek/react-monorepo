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
  name: string
  email: string
  password: string
}

interface AuthSessionResponse {
  data: AuthSession
}

interface CurrentUserResponse {
  data: {
    user: AuthUser
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

export async function getCurrentUserRequest(): Promise<AuthUser> {
  const response = await privateHttp.get<CurrentUserResponse>(
    '/auth/me',
  )

  return response.data.data.user
}

export async function logoutRequest(): Promise<void> {
  await privateHttp.post('/auth/logout')
}
