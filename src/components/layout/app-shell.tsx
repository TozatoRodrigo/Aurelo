"use client"

import { useMemo } from "react"
import Link from "next/link"
import { MobileNav } from "./mobile-nav"
import { usePathname } from "next/navigation"
import { ChatWidget } from "@/components/features/assistant/chat-widget"
import { NotificationBell } from "@/components/features/notifications/notification-bell"
import { AureloLogo } from "@/components/ui/logo/aurelo-logo"
import { Home, Calendar, Wallet, User, ArrowLeftRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Início",
    href: "/",
    icon: Home,
  },
  {
    name: "Escala",
    href: "/escala",
    icon: Calendar,
  },
  {
    name: "Trocas",
    href: "/trocas",
    icon: ArrowLeftRight,
  },
  {
    name: "Amigos",
    href: "/amigos",
    icon: Users,
  },
  {
    name: "Perfil",
    href: "/perfil",
    icon: User,
  },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  
  // Memoizar o cálculo de isAuthPage para evitar re-renders
  const isAuthPage = useMemo(() => {
    return pathname?.startsWith("/login") || pathname?.startsWith("/onboarding")
  }, [pathname])

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {!isAuthPage && (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl px-4 md:px-8 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <AureloLogo className="w-8 h-8" />
              <span className="font-bold text-lg hidden sm:inline">Aurelo</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl p-4 md:p-8">
        {children}
      </main>
      {!isAuthPage && (
        <>
          <ChatWidget />
          <MobileNav />
        </>
      )}
    </div>
  )
}
