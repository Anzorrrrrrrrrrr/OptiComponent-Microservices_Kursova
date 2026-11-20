"use client"

import { useEffect, useState } from "react"
import { type View } from "@/app/page"
import { cn } from "@/lib/utils"
import { Cpu, Package, Warehouse, ShoppingCart, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  currentView: View
  onNavigate: (view: View) => void
}

const navItems = [
  { id: "catalog" as const, label: "Catalog", icon: Package, adminOnly: false },
  { id: "inventory" as const, label: "Inventory", icon: Warehouse, adminOnly: false },
  { id: "orders" as const, label: "Orders", icon: ShoppingCart, adminOnly: false },
  { id: "dictionaries" as const, label: "Dictionaries", icon: Settings, adminOnly: true },
]

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const [userRole, setUserRole] = useState<"Admin" | "User">("User")

  useEffect(() => {
    const role = localStorage.getItem("userRole") as "Admin" | "User" | null
    const email = (localStorage.getItem("userEmail") || "").toLowerCase()
    if (role === "Admin" || email.startsWith("admin@")) {
      setUserRole("Admin")
    } else {
      setUserRole("User")
    }
  }, [currentView])

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "Admin"
  )

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    onNavigate("login")
  }

  return (
    <aside className="flex w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Cpu className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">OptiComponent</span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <Separator className="mb-4 bg-sidebar-border" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}