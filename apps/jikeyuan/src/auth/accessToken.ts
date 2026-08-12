let accessToken: string | null = null

export function getAccessToken():
  string | null {
  return accessToken
}

export function setAccessToken(
  newAccessToken: string,
): void {
  const normalizedAccessToken =
    newAccessToken.trim()

  // 刷新或登录成功时必须拿到真实 Token。
  // 空值进入内存后，会让 Redux 成功状态和请求身份互相矛盾。
  if (normalizedAccessToken.length === 0) {
    throw new Error(
      '不能保存空 Access Token',
    )
  }

  accessToken = normalizedAccessToken
}

export function clearAccessToken(): void {
  accessToken = null
}