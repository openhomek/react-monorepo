import axios, {
  type InternalAxiosRequestConfig,
} from 'axios'

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../auth/accessToken'
import { createRefreshCoordinator } from '../auth/refreshCoordinator'

// Step 1：确认当前环境要连接哪个后端。
//
// 开发、测试和生产环境的后端地址不同，
// 所以地址由 Vite 环境变量提供，不能写死在业务代码里。
const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL

// 配置根本不存在时立即停止。
// 如果继续运行，请求可能错误地发送到前端自己的域名。
if (rawApiBaseUrl === undefined) {
  throw new Error(
    '缺少 VITE_API_BASE_URL，请检查环境变量',
  )
}

const apiBaseUrl = rawApiBaseUrl.trim()

// 配置存在不代表内容有效。
// 纯空格同样不能组成正确的后端地址。
if (apiBaseUrl.length === 0) {
  throw new Error(
    'VITE_API_BASE_URL 不能为空',
  )
}

// 两个 Axios 实例访问同一个后端，所以复用基础配置。
//
// Access Token 由 JavaScript放进 Authorization Header；
// Refresh Token 由浏览器通过 HttpOnly Cookie 自动携带。
const commonConfig = {
  baseURL: apiBaseUrl,
  timeout: 10_000,

  // 前后端跨 Origin 时，浏览器默认不会携带 Cookie。
  // 开启后，刷新接口才能带上 Refresh Token Cookie。
  //
  // 后端还必须允许指定 Origin 和 Credentials，
  // 只改前端配置并不能解决 CORS。
  withCredentials: true,
}

// publicHttp 不执行自动刷新。
//
// 登录、注册和刷新接口应该使用它。
// 如果刷新接口自己返回 401 后又触发刷新，就会形成无限循环。
export const publicHttp =
  axios.create(commonConfig)

// privateHttp 用于需要登录身份的业务接口。
//
// 请求阶段：添加 Access Token。
// 响应阶段：处理 401、刷新 Token、重放原请求。
export const privateHttp =
  axios.create(commonConfig)

// 刷新接口的响应契约。
//
// 对应后端 JSON：
// {
//   "data": {
//     "accessToken": "new-token"
//   }
// }
interface RefreshResponse {
  data: {
    accessToken: string
  }
}

// Axios 原始请求配置中没有这个字段。
//
// 我们给原请求增加一个重试标记，防止：
// 401 → 刷新 → 重放 → 401 → 再刷新 → 无限循环。
interface RetryableRequestConfig
  extends InternalAxiosRequestConfig {
  hasRetriedAfterRefresh?: boolean
}

// HTTP 层只负责通知“会话已经失效”。
//
// 清理 Redux 和跳转登录页属于应用层责任，
// 不应该让底层 HTTP 模块直接依赖 Store 和 Router。
type SessionExpiredHandler = () => void

let sessionExpiredHandler:
  SessionExpiredHandler | null = null

export function setSessionExpiredHandler(
  handler: SessionExpiredHandler | null,
): void {
  sessionExpiredHandler = handler
}

function getHttpStatus(
  error: unknown,
): number | null {
  // 网络错误、普通 Error 不一定具有 Axios 响应结构。
  // 先确认类型，后面才能安全读取 response.status。
  if (!axios.isAxiosError(error)) {
    return null
  }

  const status = error.response?.status

  // 网络断开或请求超时时可能根本没有 HTTP 响应。
  // 没有状态码，就不能证明 Refresh Session 已失效。
  if (typeof status !== 'number') {
    return null
  }

  return status
}

function refreshFailureProvesSessionInvalid(
  error: unknown,
): boolean {
  const status = getHttpStatus(error)

  // 只有刷新接口明确返回 401 或 403，
  // 才能证明 Refresh Token 已过期、撤销或不再被接受。
  if (status === 401) {
    return true
  }

  if (status === 403) {
    return true
  }

  // 网络错误和服务器 500 只代表暂时无法刷新，
  // 不能直接把用户当成已经退出。
  return false
}

function notifySessionExpired(): void {
  // 旧 Access Token 已经无法恢复，必须清理。
  // 否则后续请求还会继续携带明确失效的身份。
  clearAccessToken()

  // 应用启动阶段可能还没有注册处理函数。
  // HTTP 层不假设 Redux 和 Router 已经准备完成。
  if (sessionExpiredHandler !== null) {
    sessionExpiredHandler()
  }
}

async function requestNewAccessToken():
  Promise<string> {
  try {
    // 刷新接口必须使用 publicHttp。
    //
    // 它不会添加旧 Access Token，也不会触发自动刷新，
    // 所以 /auth/refresh 返回 401 时不会产生递归调用。
    const response =
      await publicHttp.post<RefreshResponse>(
        '/auth/refresh',
      )

    const rawAccessToken =
      response.data.data.accessToken

    // TypeScript 只提供编译期类型提示，
    // 不能保证后端运行时真的返回了有效内容。
    const accessToken = rawAccessToken.trim()

    // 空 Token 不能交给等待中的请求。
    // 否则它们会携带假身份重放，然后全部再次失败。
    if (accessToken.length === 0) {
      notifySessionExpired()

      throw new Error(
        '刷新接口没有返回有效 Access Token',
      )
    }

    // 刷新成功后立即替换旧 Token。
    //
    // 后续新请求会从 getAccessToken 读到它；
    // 当前等待中的请求也会通过返回值拿到它。
    setAccessToken(accessToken)

    return accessToken
  } catch (error: unknown) {
    // 这个 catch 只负责刷新接口自己的失败。
    //
    // 因此这里的 401/403 确实来自 /auth/refresh，
    // 可以作为 Refresh Session 失效的证据。
    const sessionIsInvalid =
      refreshFailureProvesSessionInvalid(error)

    if (sessionIsInvalid) {
      notifySessionExpired()
    }

    throw error
  }
}

const refreshCoordinator = createRefreshCoordinator(
  requestNewAccessToken,
)

export async function refreshAccessToken(): Promise<string> {
  // 多个并发 401 共享同一次刷新，避免重复使用轮换中的 Refresh Token。
  return await refreshCoordinator.refresh()
}

// Step 2：给需要身份的业务请求添加 Access Token。
privateHttp.interceptors.request.use(
  function attachAccessToken(config) {
    // 每次请求发送前读取最新值。
    //
    // 不能在创建 Axios 实例时只读取一次，
    // 因为登录、刷新和退出都会改变 Access Token。
    const accessToken = getAccessToken()

    // 普通情况：当前已经有 Access Token。
    // 统一在这里组成 Bearer Header，业务 API 不重复处理格式。
    if (accessToken !== null) {
      config.headers.Authorization =
        `Bearer ${accessToken}`
    }

    // 特殊情况：应用刚打开，Access Token 可能还没有恢复。
    // 不制造 Bearer null，保持原请求不变。
    return config
  },
)

// Step 3：处理 Access Token 失效。
privateHttp.interceptors.response.use(
  function handleSuccessfulResponse(response) {
    // 成功响应保持 Axios 原结构。
    // 具体业务字段由对应的 API 模块负责提取。
    return response
  },

  async function handleFailedResponse(
    error: unknown,
  ) {
    // 不是 Axios 错误时，没有可靠的状态码和原请求配置。
    // 当前层不猜测错误来源，直接交给调用方。
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status

    const requestConfig =
      error.config as
        | RetryableRequestConfig
        | undefined

    // 不是 401，说明问题不属于 Access Token 身份失败。
    //
    // 400、403、404、500 等错误，刷新 Token 通常无法解决。
    if (status !== 401) {
      return Promise.reject(error)
    }

    // 没有原请求配置，就无法安全地重放请求。
    if (requestConfig === undefined) {
      return Promise.reject(error)
    }

    // 原请求已经使用新 Token 重放过一次。
    //
    // 再次 401 时必须停止，不能无限刷新和无限重放。
    if (
      requestConfig.hasRetriedAfterRefresh ===
      true
    ) {
      // 新 Token 重放后仍然 401，说明当前会话无法恢复。
      // 停止循环并同步清理应用层的已登录状态。
      notifySessionExpired()

      return Promise.reject(error)
    }

    // 在刷新之前先标记。
    //
    // 这样重放请求再次经过响应拦截器时，
    // 能明确知道它已经使用过一次恢复机会。
    requestConfig.hasRetriedAfterRefresh = true

    let newAccessToken: string

    try {
      // 多个并发 401 会共享同一个 refreshPromise。
      newAccessToken =
        await refreshAccessToken()
    } catch (refreshError: unknown) {
      // 刷新失败后不能继续重放原请求。
      //
      // 刷新接口返回 401/403 时，会话已经在刷新任务中清理；
      // 网络错误或 500 则保留当前用户状态，让用户稍后重试。
      return Promise.reject(refreshError)
    }

    // 原请求配置里可能还保存着过期 Token。
    // 重放前必须明确替换成刚拿到的新 Token。
    requestConfig.headers.Authorization =
      `Bearer ${newAccessToken}`

    // 重放操作放在刷新 catch 外面。
    //
    // 这样重放后的业务错误不会被误认为刷新失败，
    // 也不会因为普通业务 403/500 而错误清空整个会话。
    return privateHttp.request(requestConfig)
  },
)
