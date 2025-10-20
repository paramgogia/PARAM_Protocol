"use client"
import { Bell, User, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function TopBar() {
  return (
    <div className="h-16 border-b border-border/40 bg-card/50 flex items-center justify-between px-8">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Welcome back</h2>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="p-2 hover:bg-card rounded-lg transition text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-card rounded-lg transition text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-card rounded-lg transition text-muted-foreground hover:text-foreground">
          <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
