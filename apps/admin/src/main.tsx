import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@react-monorepo/ui/styles/globals.css'
import { Button } from '@react-monorepo/ui'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="page">
      <p className="eyebrow">React Monorepo</p>
      <h1>Admin 项目</h1>
      <p>Admin 有自己的入口、配置与开发服务器。</p>
      <Button onClick={() => alert('Admin app is ready!')}>测试共享组件</Button>
    </main>
  </StrictMode>,
)
