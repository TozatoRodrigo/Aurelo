"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  showStatus = false,
  status = "online",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  showStatus?: boolean
  status?: "online" | "offline" | "away"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-visible rounded-full",
        className
      )}
      {...props}
    >
      {props.children}
      {showStatus && (
        <motion.div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background shadow-sm",
            "size-3 [.w-16_&]:size-3 [.w-20_&]:size-3.5 [.w-24_&]:size-4 [.h-16_&]:size-3 [.h-20_&]:size-3.5 [.h-24_&]:size-4",
            status === "online" && "bg-green-500",
            status === "offline" && "bg-muted-foreground",
            status === "away" && "bg-yellow-500"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-gradient-to-br from-primary/20 to-accent/20 flex size-full items-center justify-center rounded-full text-sm font-semibold text-primary shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
