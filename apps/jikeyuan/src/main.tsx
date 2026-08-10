import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import './style.css'
import router from './router'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('找不到 #root，请检查 index.html')
}

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)