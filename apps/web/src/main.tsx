import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from '@react-monorepo/ui'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="page">
      <p className="eyebrow">React Monorepo</p>
      <h1>Web 项目</h1>
      <p>这是一个独立的 Vite 应用，并正在使用共享 UI 包。</p>
      <Button onClick={() => alert('Web app is ready!')}>测试共享组件</Button>
    </main>
  </StrictMode>,
)
