"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LoginView } from "@/components/views/login-view"
import { CatalogView } from "@/components/views/catalog-view"
import { InventoryView } from "@/components/views/inventory-view"
import { OrdersView } from "@/components/views/orders-view"
import { DictionariesView } from "@/components/views/dictionaries-view"

export type View = "login" | "catalog" | "inventory" | "orders" | "dictionaries"

// Пошти, які гарантовано отримують права адміністратора
const ADMIN_EMAILS = [
  "admin@gmail.com",
  "admin@opticomponent.com",
  "admin@ukr.net"
]

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("login")
  const [userRole, setUserRole] = useState<"Admin" | "User">("User")

  // Функція визначення ролі та пошти з JWT-токена після логіну
  const detectUserRoleFromSession = () => {
    const token = localStorage.getItem("authToken")
    let detectedRole: "Admin" | "User" = "User"
    let detectedEmail = localStorage.getItem("userEmail") || ""

    if (token) {
      try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))))

        const jwtEmail = (
          payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
          payload.email ||
          payload.unique_name ||
          payload.sub ||
          detectedEmail
        ).toLowerCase()

        const jwtRole =
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          payload.role ||
          payload.Role

        if (jwtEmail) {
          detectedEmail = jwtEmail
          localStorage.setItem("userEmail", jwtEmail)
        }

        if (
          jwtRole === "Admin" ||
          ADMIN_EMAILS.includes(jwtEmail) ||
          jwtEmail.startsWith("admin@")
        ) {
          detectedRole = "Admin"
        }
      } catch (e) {
        console.error("Помилка розшифровки JWT-токена:", e)
      }
    }

    localStorage.setItem("userRole", detectedRole)
    setUserRole(detectedRole)
  }

  useEffect(() => {
    if (currentView !== "login") {
      detectUserRoleFromSession()
    }
  }, [currentView])

  const handleLoginSuccess = () => {
    detectUserRoleFromSession()
    setCurrentView("catalog")
  }

  // Захист маршрутів: якщо User намагається відкрити Dictionaries, перенаправляємо в Catalog
  const handleNavigate = (view: View) => {
    if (view === "dictionaries" && userRole !== "Admin") {
      alert("Доступ обмежено: редагування довідників доступне лише для ролі Admin.")
      return
    }
    setCurrentView(view)
  }

  if (currentView === "login") {
    return <LoginView onLogin={handleLoginSuccess} />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Викликаємо Header без зайвих пропсів пошуку */}
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {currentView === "catalog" && <CatalogView />}
          {currentView === "inventory" && <InventoryView />}
          {currentView === "orders" && <OrdersView />}
          {currentView === "dictionaries" && userRole === "Admin" && <DictionariesView />}
        </main>
      </div>
    </div>
  )
}