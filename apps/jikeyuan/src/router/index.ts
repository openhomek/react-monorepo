import { createBrowserRouter } from 'react-router-dom'

import Home from '../pages/Home'
import Layout from '../pages/Layout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import GuestOnly from './GuestOnly'

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
    Component: GuestOnly,
    children: [
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/register',
        Component: Register,
      },
    ],
  },
])

export default router
