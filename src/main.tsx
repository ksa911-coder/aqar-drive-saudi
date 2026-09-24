import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'

// استخدام الإعداد الجاهز للـ Router من ملف router.tsx
const router = getRouter()

// تسجيل الـ Router لضمان توافق الأنواع (TypeScript)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// العثور على عنصر الجذر وتشغيل التطبيق
const rootElement = document.getElementById('root')

if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}