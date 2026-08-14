import { createBrowserRouter } from 'react-router-dom'

import Home from '../pages/Home'
import Community from '../pages/Community'
import Guide from '../pages/Guide'
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
      {
        path: 'community',
        Component: Community,
      },
      {
        path: 'guides/:slug',
        Component: Guide,
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
