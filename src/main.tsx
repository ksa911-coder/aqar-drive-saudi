import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles.css'

// إنشاء الـ Router باستخدام شجرة المسارات المولدة
const router = createRouter({ routeTree })

// تسجيل الـ Router لضمان التوافق مع الأنواع (TypeScript)
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