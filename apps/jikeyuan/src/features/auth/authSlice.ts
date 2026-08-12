import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import axios from 'axios'

import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '../../apis/auth'
import { refreshAccessToken } from '../../apis/http'
import {
  clearAccessToken,
  setAccessToken,
} from '../../auth/accessToken'

export type AuthStatus =
  | 'checking'
  | 'anonymous'
  | 'submitting'
  | 'authenticated'

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  errorMessage: string
}

interface AuthThunkConfig {
  rejectValue: string
}

const initialState: AuthState = {
  user: null,
  status: 'checking',
  errorMessage: '',
}

function getResponseStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error)) {
    return null
  }

  const status = error.response?.status

  if (typeof status !== 'number') {
    return null
  }

  return status
}

export const initializeSession = createAsyncThunk<
  AuthUser,
  void,
  AuthThunkConfig
>(
  'auth/initializeSession',
  async (_unused, thunkApi) => {
    try {
      // 页面刷新会清空内存 Token，先用 HttpOnly Cookie 恢复它。
      await refreshAccessToken()

      // Redux 需要用户资料，Access Token 本身不进入 Store。
      return await getCurrentUserRequest()
    } catch (error: unknown) {
      clearAccessToken()

      const status = getResponseStatus(error)

      if (status === 401 || status === 403) {
        return thunkApi.rejectWithValue('')
      }

      return thunkApi.rejectWithValue(
        '暫時無法恢復登入狀態，請稍後重新整理',
      )
    }
  },
)

export const loginAccount = createAsyncThunk<
  AuthUser,
  LoginPayload,
  AuthThunkConfig
>(
  'auth/login',
  async (payload, thunkApi) => {
    try {
      const session = await loginRequest(payload)

      // Access Token 只留在模块内存中，避免进入持久化和 Redux DevTools。
      setAccessToken(session.accessToken)

      return session.user
    } catch (error: unknown) {
      const status = getResponseStatus(error)

      if (status === 401) {
        return thunkApi.rejectWithValue('電郵地址或密碼錯誤')
      }

      if (status === 429) {
        return thunkApi.rejectWithValue(
          '嘗試次數過多，請稍後再試',
        )
      }

      return thunkApi.rejectWithValue(
        '登入失敗，請稍後重試',
      )
    }
  },
)

export const registerAccount = createAsyncThunk<
  AuthUser,
  RegisterPayload,
  AuthThunkConfig
>(
  'auth/register',
  async (payload, thunkApi) => {
    try {
      const session = await registerRequest(payload)

      setAccessToken(session.accessToken)

      return session.user
    } catch (error: unknown) {
      const status = getResponseStatus(error)

      if (status === 409) {
        return thunkApi.rejectWithValue('此電郵地址已經註冊')
      }

      if (status === 429) {
        return thunkApi.rejectWithValue(
          '註冊操作過於頻繁，請稍後再試',
        )
      }

      return thunkApi.rejectWithValue(
        '註冊失敗，請稍後重試',
      )
    }
  },
)

export const logoutAccount = createAsyncThunk<
  void,
  void,
  AuthThunkConfig
>(
  'auth/logout',
  async (_unused, thunkApi) => {
    try {
      // 后端先撤销 Refresh Token Family，再清理本地短期 Token。
      await logoutRequest()
      clearAccessToken()
    } catch {
      return thunkApi.rejectWithValue(
        '登出失敗，請檢查網絡後重試',
      )
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.errorMessage = ''
    },
    sessionExpired(state) {
      state.user = null
      state.status = 'anonymous'
      state.errorMessage = '登入狀態已過期，請重新登入'
    },
  },
  extraReducers(builder) {
    builder
      .addCase(initializeSession.pending, (state) => {
        state.status = 'checking'
        state.errorMessage = ''
      })
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
        state.errorMessage = ''
      })
      .addCase(initializeSession.rejected, (state, action) => {
        state.user = null
        state.status = 'anonymous'
        state.errorMessage = action.payload ?? ''
      })
      .addCase(loginAccount.pending, (state) => {
        state.status = 'submitting'
        state.errorMessage = ''
      })
      .addCase(loginAccount.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
        state.errorMessage = ''
      })
      .addCase(loginAccount.rejected, (state, action) => {
        state.user = null
        state.status = 'anonymous'
        state.errorMessage =
          action.payload ?? '登入失敗，請稍後重試'
      })
      .addCase(registerAccount.pending, (state) => {
        state.status = 'submitting'
        state.errorMessage = ''
      })
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
        state.errorMessage = ''
      })
      .addCase(registerAccount.rejected, (state, action) => {
        state.user = null
        state.status = 'anonymous'
        state.errorMessage =
          action.payload ?? '註冊失敗，請稍後重試'
      })
      .addCase(logoutAccount.fulfilled, (state) => {
        state.user = null
        state.status = 'anonymous'
        state.errorMessage = ''
      })
      .addCase(logoutAccount.rejected, (state, action) => {
        state.errorMessage =
          action.payload ?? '登出失敗，請稍後重試'
      })
  },
})

export const {
  clearAuthError,
  sessionExpired,
} = authSlice.actions

export default authSlice.reducer
