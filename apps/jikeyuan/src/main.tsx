import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'

import { setSessionExpiredHandler } from './apis/http'
import {
  initializeSession,
  sessionExpired,
} from './features/auth/authSlice'
import './layers.css'
import './style.css'
import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
import router from './router'
import { store } from './store'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('找不到 #root，請檢查 index.html')
}

const root = ReactDOM.createRoot(rootElement)

setSessionExpiredHandler(() => {
  store.dispatch(sessionExpired())
})

// StrictMode 会重复执行开发环境中的 Effect，因此在 React 外只恢复一次会话。
store.dispatch(initializeSession())

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
