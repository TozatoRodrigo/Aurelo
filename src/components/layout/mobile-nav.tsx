"use client"

import { Home, Calendar, Wallet, User, ArrowLeftRight, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:hidden">
      <nav className="flex items-center justify-around rounded-3xl bg-background/95 backdrop-blur-xl p-2 shadow-xl border border-border/50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-colors min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bubble"
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
