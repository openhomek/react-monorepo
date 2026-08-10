import { createBrowserRouter } from 'react-router-dom'

import Home from '../pages/Home'
import Layout from '../pages/Layout'
import Login from '../pages/Login'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
    ],
  },
  {
    path: '/login',
    Component: Login,
  },
])

export default router