import { createBrowserRouter } from 'react-router-dom'

import Home from '../pages/Home'
import AskQuestion from '../pages/AskQuestion'
import Community from '../pages/Community'
import Guide from '../pages/Guide'
import Guides from '../pages/Guides'
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
        path: 'questions/new',
        Component: AskQuestion,
      },
      {
        path: 'guides',
        Component: Guides,
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
