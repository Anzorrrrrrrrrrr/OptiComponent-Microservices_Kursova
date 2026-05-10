"use client"

import { useState } from "react"
import { Cpu, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"

interface LoginViewProps {
  onLogin: () => void
}

export function LoginView({ onLogin }: LoginViewProps) {
  // Керування вкладками (щоб після реєстрації перекинути на логін)
  const [activeTab, setActiveTab] = useState("login")

  // Стейт для логіну
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  // Стейт для реєстрації
  const [registerName, setRegisterName] = useState("") // Поки що не відправляємо на бекенд, але залишаємо для UI
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)

  // === ЛОГІКА ВХОДУ ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoginLoading(true)

    try {
      // УВАГА: Перевірте, чи правильний порт (тут 5247, як було у вашому коментарі)
      const response = await axios.post("https://localhost:7012/api/auth/login", {
        email: loginEmail,
        password: loginPassword
      })

      const token = response.data.access_token 
      localStorage.setItem("authToken", token)
      onLogin() 
    } catch (error) {
      console.error("Помилка входу:", error)
      alert("Невірний логін або пароль. Перевірте дані.")
    } finally {
      setIsLoginLoading(false)
    }
  }

  // === НОВА ЛОГІКА РЕЄСТРАЦІЇ ===
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Базова перевірка на фронтенді
    if (registerPassword !== registerConfirmPassword) {
      alert("Паролі не співпадають!")
      return
    }

    if (registerPassword.length < 6) {
      alert("Пароль має містити щонайменше 6 символів.")
      return
    }

    setIsRegisterLoading(true)

    try {
      // Відправляємо дані на бекенд (згідно з вашим RegisterDto: Email та Password)
      await axios.post("https://localhost:7012/api/auth/register", {
        email: registerEmail,
        password: registerPassword
      })

      alert("Реєстрація успішна! Тепер ви можете увійти.")
      
      // Автоматично перекидаємо на вкладку логіну і підставляємо email
      setLoginEmail(registerEmail)
      setLoginPassword("")
      setActiveTab("login")

    } catch (error: any) {
      console.error("Помилка реєстрації:", error)
      // C# Identity зазвичай повертає масив помилок, якщо пароль надто слабкий (немає великих літер, цифр тощо)
      if (error.response && error.response.data) {
        alert("Помилка реєстрації. Можливо, пароль занадто простий або такий email вже існує.\n\nДеталі в консолі (F12).")
        console.log(error.response.data)
      } else {
        alert("Не вдалося підключитися до сервера.")
      }
    } finally {
      setIsRegisterLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <Card className="w-full max-w-md border-sidebar-border bg-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Cpu className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">OptiComponent</CardTitle>
            <CardDescription>Microelectronics inventory management</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          
          {/* Додали value та onValueChange для керування вкладками */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* ВКЛАДКА ЛОГІНУ */}
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@opticomponent.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoginLoading}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoginLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Button type="submit" className="w-full mt-2" disabled={isLoginLoading}>
                    {isLoginLoading ? "Перевірка..." : "Sign In"}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
            
            {/* ВКЛАДКА РЕЄСТРАЦІЇ */}
            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegister}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="register-email">Email</FieldLabel>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="user@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isRegisterLoading}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="register-password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        disabled={isRegisterLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="register-confirm-password">Confirm Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        disabled={isRegisterLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Button type="submit" className="w-full mt-2" disabled={isRegisterLoading}>
                    {isRegisterLoading ? "Створення..." : "Create Account"}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}