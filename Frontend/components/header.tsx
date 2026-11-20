"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ADMIN_EMAILS = [
  "admin@opticomponent.com",
  "admin@gmail.com",
  "admin@ukr.net"
]

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<"Admin" | "User">("User")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const savedEmail = localStorage.getItem("userEmail")
    const savedRole = localStorage.getItem("userRole") as "Admin" | "User" | null

    if (savedEmail) setUserEmail(savedEmail)
    if (savedRole === "Admin" || savedRole === "User") setUserRole(savedRole)

    if (token) {
      try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        )

        const decoded = JSON.parse(jsonPayload)
        const email = (
          decoded.email ||
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
          savedEmail ||
          ""
        ).toLowerCase()

        const jwtRole =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.role ||
          decoded.Role

        if (email) {
          setUserEmail(email)
          localStorage.setItem("userEmail", email)
        }

        if (
          jwtRole === "Admin" ||
          ADMIN_EMAILS.includes(email) ||
          email.startsWith("admin@")
        ) {
          setUserRole("Admin")
          localStorage.setItem("userRole", "Admin")
        } else {
          setUserRole("User")
          localStorage.setItem("userRole", "User")
        }
      } catch (e) {
        console.error("Помилка розшифровки токена:", e)
      }
    }
  }, [])

  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "AD"

  return (
    <header className="flex h-16 items-center justify-end border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium leading-none text-foreground">
            {userEmail || "Завантаження..."}
          </span>
          <span
            className={`text-xs mt-1 font-semibold ${
              userRole === "Admin" ? "text-indigo-600" : "text-muted-foreground"
            }`}
          >
            {userRole}
          </span>
        </div>
        <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition">
          <AvatarImage
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
            alt="User Avatar"
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}