"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LoginView } from "@/components/views/login-view"
import { CatalogView } from "@/components/views/catalog-view"
import { InventoryView } from "@/components/views/inventory-view"
import { OrdersView } from "@/components/views/orders-view"
import { DictionariesView } from "@/components/views/dictionaries-view"

export type View = "login" | "catalog" | "inventory" | "orders" | "dictionaries"

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("login")

  if (currentView === "login") {
    return <LoginView onLogin={() => setCurrentView("catalog")} />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Викликаємо Header без зайвих пропсів пошуку */}
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {currentView === "catalog" && <CatalogView />}
          {currentView === "inventory" && <InventoryView />}
          {currentView === "orders" && <OrdersView />}
          {currentView === "dictionaries" && <DictionariesView />}
        </main>
      </div>
    </div>
  )
}