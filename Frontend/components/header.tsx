"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Витягуємо дані користувача з JWT токена при завантаженні
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        
        // В C# Identity email може зберігатися або під ключем 'email', або під довгим стандартом XML
        const email = decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        if (email) {
          setUserEmail(email);
        }
      } catch (e) {
        console.error("Помилка розшифровки токена:", e);
      }
    }
  }, []);

  // Робимо красиві ініціали для аватарки з перших двох літер email
  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "AD";

  return (
    <header className="flex h-16 items-center justify-end border-b bg-card px-6">
      {/* Блок користувача (Дзвіночок та лінію розділювача видалено) */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium leading-none text-foreground">
            {userEmail || "Завантаження..."}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            User
          </span>
        </div>
        <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" alt="User Avatar" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}